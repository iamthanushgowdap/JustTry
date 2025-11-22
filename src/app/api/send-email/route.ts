import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAILTRAP_API_KEY = process.env.MAILTRAP_API_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Determine which email service to use (temporarily enabling Gmail for testing)
console.log('🔍 Debug env vars:', {
  GMAIL_USER: GMAIL_USER,
  GMAIL_APP_PASSWORD: GMAIL_APP_PASSWORD ? '[PRESENT]' : '[MISSING]',
  MAILTRAP_API_KEY: MAILTRAP_API_KEY ? '[PRESENT]' : '[MISSING]',
  RESEND_API_KEY: RESEND_API_KEY ? '[PRESENT]' : '[MISSING]'
});

const EMAIL_SERVICE = GMAIL_USER && GMAIL_APP_PASSWORD ? 'gmail' :
                     MAILTRAP_API_KEY ? 'mailtrap' :
                     RESEND_API_KEY ? 'resend' : null;

console.log('📧 Email service detection:', {
  gmail: { user: GMAIL_USER, hasPassword: !!GMAIL_APP_PASSWORD },
  mailtrap: !!MAILTRAP_API_KEY,
  resend: !!RESEND_API_KEY,
  selected: EMAIL_SERVICE
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { custom, subject: inputSubject, htmlContent: inputHtmlContent, textContent: inputTextContent, ...otherParams } = body;

    // TEMPORARY: Disabled debug skip to test Gmail sending
    if (false) { // process.env.NODE_ENV === 'development' && process.env.SKIP_EMAIL_SENDING === 'true'
      console.log('📧 Email sending temporarily disabled for debugging');
      return NextResponse.json({
        success: true,
        emailId: 'debug-skip-' + Date.now(),
        message: 'Email sending temporarily disabled for debugging'
      });
    }

    let email: string, name: string, serviceType: string, status: string, leadId: string;
    let subject = '', htmlContent = '', textContent = '';

    if (custom) {
      // Custom email from the dialog
      ({ email, name, subject, htmlContent, textContent, leadId } = body);
      serviceType = 'Custom';
      status = 'Manual';
    } else {
      // Automated email
      ({ email, name, serviceType, status, leadId } = otherParams);
    }

    if (!OPENROUTER_API_KEY) { // Temporarily removed EMAIL_SERVICE check
      console.warn('Email automation not configured - missing OpenRouter API key');
      return NextResponse.json({
        success: false,
        message: 'Email automation not configured - missing OpenRouter API key'
      });
    }

    let finalSubject = subject || inputSubject;
    let finalHtmlContent = htmlContent || inputHtmlContent;
    let finalTextContent = textContent || inputTextContent;

    // If not custom email, generate content using AI
    if (!custom) {
      const emailContent = await generateEmailContent(serviceType, status, name);
      finalSubject = generateEmailSubject(serviceType, status);
      finalHtmlContent = emailContent.html;
      finalTextContent = emailContent.text;
    }

    // Send email via the configured service (forcing Gmail for testing)
    console.log('📧 Sending email via: gmail (forced for testing)');
    let emailResult;
    console.log('📧 Using Gmail SMTP');
    emailResult = await sendViaGmail(finalSubject, finalHtmlContent, finalTextContent, email);

    console.log('Email sent successfully:', emailResult);

    return NextResponse.json({
      success: true,
      emailId: emailResult.id,
      message: custom ? 'Custom email sent successfully' : 'AI-generated email sent successfully'
    });

  } catch (error) {
    console.error('Email automation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Ensure we always return JSON, never HTML
    return NextResponse.json({
      success: false,
      message: 'Failed to send email',
      error: errorMessage
    }, { status: 500 });
  }
}

// Helper function to send email via Gmail SMTP
async function sendViaGmail(subject: string, htmlContent: string, textContent: string, toEmail: string) {
  console.log('Gmail SMTP Configuration:');
  console.log('- From Email:', GMAIL_USER);
  console.log('- To Email:', toEmail);
  console.log('- App Password Present:', !!GMAIL_APP_PASSWORD);
  console.log('- App Password Length:', GMAIL_APP_PASSWORD?.length || 0);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"JustTry CRM" <${GMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: htmlContent,
    text: textContent,
  };

  console.log('Sending email with options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    hasHtml: !!mailOptions.html,
    hasText: !!mailOptions.text,
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Gmail email sent successfully:', info.messageId);
    return { id: info.messageId, success: true };
  } catch (error: any) {
    console.error('Gmail SMTP Error Details:');
    console.error('- Error Code:', error.code);
    console.error('- Error Message:', error.message);
    console.error('- Full Error:', error);

    // Provide helpful error messages for common Gmail issues
    let errorMessage = 'Gmail email sending failed';

    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Please check: 1) App Password is correct, 2) 2FA is enabled, 3) App Password has no spaces';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message && error.message.includes('Invalid login')) {
      errorMessage = 'Invalid Gmail credentials. Please double-check your Gmail email and App Password.';
    } else if (error.message && error.message.includes('Application-specific password required')) {
      errorMessage = 'Gmail requires an App Password, not your regular password. Generate one at https://myaccount.google.com/apppasswords';
    } else if (error.message) {
      errorMessage = `Gmail SMTP error: ${error.message}`;
    }

    console.error('Final Error Message:', errorMessage);
    throw new Error(errorMessage);
  }
}
async function sendViaMailtrap(subject: string, htmlContent: string, textContent: string, toEmail: string) {
  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MAILTRAP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        email: 'crm@justtry.com',
        name: 'JustTry CRM'
      },
      to: [{
        email: toEmail
      }],
      subject: subject,
      html: htmlContent,
      text: textContent,
      category: 'CRM Email'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Mailtrap API error:', response.status, errorText);
    throw new Error(`Mailtrap email sending failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to send email via Resend
async function sendViaResend(subject: string, htmlContent: string, textContent: string, email: string, serviceType: string, leadId: string, status: string, custom: boolean) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'JustTry CRM <crm@resend.dev>', // Using Resend's verified domain for testing
      to: [email],
      subject: subject,
      html: htmlContent,
      text: textContent,
      tags: [
        {
          name: 'service_type',
          value: serviceType,
        },
        {
          name: 'lead_id',
          value: leadId,
        },
        {
          name: 'status',
          value: status,
        },
        {
          name: 'custom_email',
          value: custom ? 'true' : 'false',
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API error:', response.status, errorText);

    // Provide helpful error messages for common issues
    if (response.status === 403 && errorText.includes('domain is not verified')) {
      throw new Error(`Email sending failed: Domain not verified. For testing, the system uses crm@resend.dev. For production, verify your domain at https://resend.com/domains`);
    }

    throw new Error(`Email sending failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function generateEmailContent(serviceType: string, status: string, name: string) {
  const systemPrompt = `You are a professional CRM assistant for JustTry CRM. Generate a personalized, professional email congratulating a customer on their ${serviceType} approval. Keep it concise, friendly, and informative. Include next steps and contact information.

Requirements:
- Professional yet warm tone
- Include customer's name
- Mention specific service type and status
- Provide clear next steps
- ALWAYS sign off as "JustTry CRM Team" with contact info: support@justtry.com, +91-XXXX-XXXXXX, www.justtry.com
- DO NOT use placeholders like [Your Name] or [Company Name] - use actual JustTry CRM branding
- Keep under 200 words
- Format as both HTML and plain text`;

  const userPrompt = `Generate an email for:
- Customer Name: ${name}
- Service Type: ${serviceType}
- Status: ${status}

The email should congratulate them and provide relevant information about their ${serviceType} approval.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'JustTry CRM'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Reliable Claude model on OpenRouter
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const aiContent = result.choices[0].message.content.trim();

    // Convert to HTML format
    const htmlContent = aiContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');

    return {
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Congratulations ${name}!</h2>
        ${htmlContent}
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          <strong>JustTry CRM Team</strong><br>
          Email: support@justtry.com<br>
          Phone: +91-XXXX-XXXXXX<br>
          Website: www.justtry.com
        </p>
      </div>`,
      text: aiContent + '\n\n---\nJustTry CRM Team\nEmail: support@justtry.com\nPhone: +91-XXXX-XXXXXX\nWebsite: www.justtry.com'
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    // Fallback content
    const fallbackContent = `Dear ${name},

Congratulations! Your ${serviceType} application has been ${status.toLowerCase()}.

We're excited to help you with your ${serviceType.toLowerCase()} needs. Our team will be in touch shortly with next steps.

Best regards,
JustTry CRM Team`;

    return {
      html: fallbackContent.replace(/\n/g, '<br>'),
      text: fallbackContent
    };
  }
}

function generateEmailSubject(serviceType: string, status: string): string {
  const subjects: Record<string, Record<string, string>> = {
    'Loan': {
      'Approved': '🎉 Congratulations! Your Loan Application Has Been Approved'
    },
    'Investment': {
      'Activated': '🚀 Your Investment Account is Now Active!'
    },
    'Insurance': {
      'Policy Issued': '✅ Your Insurance Policy is Ready!'
    }
  };

  return subjects[serviceType]?.[status] || `Update on Your ${serviceType} Application`;
}
