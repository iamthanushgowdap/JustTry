import { NextRequest, NextResponse } from 'next/server';

const BLAND_AI_API_KEY = process.env.BLAND_AI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { phone, name, serviceType, status, leadId } = await request.json();

    if (!BLAND_AI_API_KEY) {
      console.warn('Bland AI API key not configured, skipping AI call');
      return NextResponse.json({ success: false, message: 'AI calling not configured' });
    }

    // Create call script based on service type and status
    const callScript = generateCallScript(serviceType, status, name);

    // Make call using Bland AI with complete configuration
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': BLAND_AI_API_KEY
      },
      body: JSON.stringify({
        phone_number: phone.startsWith('+') ? phone : `+91${phone}`, // Ensure international format
        task: callScript,
        voice: "e1289219-0ea2-4f22-a994-c542c2a48a0f", // Specific voice ID
        wait_for_greeting: false,
        record: true,
        answered_by_enabled: true,
        noise_cancellation: false,
        interruption_threshold: 500,
        block_interruptions: false,
        max_duration: 12,
        model: "base",
        language: "en",
        background_track: "none",
        endpoint: "https://api.bland.ai",
        voicemail_action: "hangup",
        json_mode_enabled: true,
        metadata: {
          leadId: leadId,
          serviceType: serviceType,
          status: status,
          customerName: name
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bland AI API error:', response.status, errorText);
      throw new Error(`Bland AI API error: ${response.status} - ${errorText}`);
    }

    const callData = await response.json();
    console.log('Bland AI call initiated:', callData);

    return NextResponse.json({
      success: true,
      callId: callData.call_id || callData.id,
      message: 'AI call initiated successfully'
    });

  } catch (error) {
    console.error('AI call error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      message: 'Failed to initiate AI call',
      error: errorMessage
    }, { status: 500 });
  }
}

function generateCallScript(serviceType: string, status: string, name: string): string {
  const greeting = `Hello ${name}! This is an automated call from JustTry CRM.`;

  switch (serviceType) {
    case 'Loan':
      if (status === 'Approved') {
        return `${greeting} Great news! Your loan application has been approved. Congratulations on your new loan! 

        I can help answer any questions you might have about:
        - Next steps for loan disbursement
        - Interest rates and terms
        - Documentation requirements
        - Payment schedule
        - Any other loan-related questions

        How can I assist you today?`;
      }
      break;

    case 'Investment':
      if (status === 'Activated') {
        return `${greeting} Excellent news! Your investment account has been successfully activated.

        I can help you with:
        - Understanding your portfolio
        - Investment strategy details
        - Account management
        - Performance tracking
        - Additional investment opportunities
        - Any questions about your investments

        What would you like to know about your investment account?`;
      }
      break;

    case 'Insurance':
      if (status === 'Policy Issued') {
        return `${greeting} Wonderful news! Your insurance policy has been successfully issued and is now active.

        I can provide information about:
        - Policy details and coverage
        - Premium payment information
        - Claim process
        - Policy benefits
        - Renewal information
        - Any questions about your coverage

        How can I help you with your new insurance policy?`;
      }
      break;
  }

  return `${greeting} We have an important update about your ${serviceType.toLowerCase()} application. Please call us back at your convenience to discuss the details.`;
}
