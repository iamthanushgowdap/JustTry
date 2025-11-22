import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { userInput, leadDetails } = await request.json();

    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not configured');
      return NextResponse.json({
        success: false,
        message: 'AI email generation not configured'
      });
    }

    // Generate custom email content using AI
    const emailContent = await generateCustomEmailContent(userInput, leadDetails);

    return NextResponse.json({
      success: true,
      content: emailContent
    });

  } catch (error) {
    console.error('Custom email generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      message: 'Failed to generate email',
      error: errorMessage
    }, { status: 500 });
  }
}

async function generateCustomEmailContent(userInput: string, leadDetails: any) {
  const systemPrompt = `You are a professional CRM assistant for JustTry CRM. Generate a personalized, professional email FROM JustTry CRM TO the customer based on the CRM agent's request.

IMPORTANT: The user input represents what the CRM agent wants to communicate TO the customer. Do NOT just copy the user input - rephrase it into proper, professional email language.

For example, if user input is: "hi there loan is mistakenly approved and later i will change to normal state. sorry for the mistake. thank you"
Generate a professional email like: "We regret to inform you that your loan application was mistakenly marked as approved. We will be correcting this status shortly."

Requirements:
- Professional yet warm tone
- Start with "Dear [Customer Name]"
- Rephrase the user input into proper business English
- Include relevant lead information (service type, current status, value, etc.)
- Provide clear call-to-action or next steps
- Format as both HTML and plain text
- ALWAYS sign off as "JustTry CRM Team" with contact info: support@justtry.com, +91-XXXX-XXXXXX, www.justtry.com
- DO NOT use placeholders like [Your Name] or [Company Name] - use actual JustTry CRM branding
- Be empathetic and understanding, especially for corrections or mistakes
- Keep concise but comprehensive (150-300 words)

Lead Details Available:
- Name: ${leadDetails.name}
- Email: ${leadDetails.email}
- Phone: ${leadDetails.phone}
- Service Type: ${leadDetails.serviceType}
- Sub-Category: ${leadDetails.subCategory}
- Current Status: ${leadDetails.status}
- Value: ${leadDetails.value}

Generate a complete, ready-to-send email based on the CRM agent's 3-line request. Include subject line and full email content from CRM to customer.`;

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
            content: `CRM Agent's message to customer: "${userInput}"\n\nPlease generate a complete professional email FROM JustTry CRM TO the customer ${leadDetails.name} conveying this message. Include subject line and full email content.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const aiContent = result.choices[0].message.content.trim();

    // Split into subject and body (AI should provide both)
    const lines = aiContent.split('\n');
    const subjectLine = lines.find((line: string) => line.toLowerCase().startsWith('subject:'))?.replace(/^subject:/i, '').trim() || 'Update from JustTry CRM';
    const bodyContent = lines.filter((line: string) => !line.toLowerCase().startsWith('subject:')).join('\n').trim();

    // Convert to HTML format
    const htmlContent = bodyContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');

    return {
      subject: subjectLine,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${htmlContent}
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          <strong>JustTry CRM Team</strong><br>
          Email: support@justtry.com<br>
          Phone: +91-XXXX-XXXXXX<br>
          Website: www.justtry.com
        </p>
      </div>`,
      text: bodyContent + '\n\n---\nJustTry CRM Team\nEmail: support@justtry.com\nPhone: +91-XXXX-XXXXXX\nWebsite: www.justtry.com'
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    // Better fallback content - rephrase user input professionally
    const fallbackSubject = `Update Regarding Your ${leadDetails.serviceType} Application`;

    // Simple rephrasing of common patterns
    let rephrasedContent = userInput;

    // Replace casual language with professional language
    rephrasedContent = rephrasedContent.replace(/hi there/i, 'We wanted to inform you that');
    rephrasedContent = rephrasedContent.replace(/sorry for the mistake/i, 'We sincerely apologize for this error');
    rephrasedContent = rephrasedContent.replace(/thank you/i, 'Thank you for your understanding');
    rephrasedContent = rephrasedContent.replace(/will change to normal state/i, 'will be corrected to its proper status');
    rephrasedContent = rephrasedContent.replace(/mistakenly approved/i, 'was inadvertently marked as approved');

    // If the rephrasing didn't change much, create a proper message
    if (rephrasedContent === userInput || rephrasedContent.length < 20) {
      if (userInput.toLowerCase().includes('mistake') || userInput.toLowerCase().includes('error')) {
        rephrasedContent = `We regret to inform you that there was an error with your ${leadDetails.serviceType} application status. We are currently correcting this issue and will update you once it's resolved.`;
      } else {
        rephrasedContent = `We wanted to provide you with an important update regarding your ${leadDetails.serviceType} application. ${userInput}`;
      }
    }

    const fallbackBody = `Dear ${leadDetails.name},

${rephrasedContent}

We appreciate your patience and understanding during this process.

Please don't hesitate to contact us if you have any questions or need further clarification.

Best regards,
JustTry CRM Team`;

    return {
      subject: fallbackSubject,
      html: fallbackBody.replace(/\n/g, '<br>'),
      text: fallbackBody
    };
  }
}
