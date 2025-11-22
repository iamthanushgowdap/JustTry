import axios from 'axios';

// Razorpay configuration for Indian payments
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

// Fallback to mock mode if keys not configured
const isRazorpayConfigured = razorpayKeyId !== 'rzp_test_placeholder' && razorpayKeySecret !== 'secret_placeholder';

export interface BankTransferDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'savings' | 'current';
}

export interface DisbursementResult {
  success: boolean;
  referenceId: string;
  gatewayResponse?: any;
  error?: string;
}

export class PaymentService {
  /**
   * Create a bank transfer using Razorpay for Indian users
   * In a real implementation, this would integrate with actual bank transfer APIs
   */
  static async disburseLoanAmount(
    amount: number,
    bankDetails: BankTransferDetails,
    leadId: string,
    customerEmail: string
  ): Promise<DisbursementResult> {
    try {
      // Check if Razorpay is properly configured
      if (!isRazorpayConfigured) {
        console.warn('Razorpay API keys not configured. Using mock disbursement for testing.');
        // Return mock successful response for testing without Razorpay
        return {
          success: true,
          referenceId: `mock-${Date.now()}`,
          gatewayResponse: {
            id: `mock-${Date.now()}`,
            status: 'processed',
            amount: amount,
            currency: 'INR',
            created_at: Math.floor(Date.now() / 1000),
            description: `Loan disbursement for Lead ${leadId}`,
            metadata: {
              leadId,
              bankName: bankDetails.bankName,
              accountNumber: bankDetails.accountNumber,
              ifscCode: bankDetails.ifscCode,
              disbursementType: 'loan'
            }
          }
        };
      }

      // Create contact in Razorpay
      console.log('Creating contact in Razorpay...');
      const contactResponse = await axios.post(
        'https://api.razorpay.com/v1/contacts',
        {
          name: bankDetails.accountHolderName,
          email: customerEmail,
          contact: '9999999999', // Placeholder phone, in real app get from lead
          type: 'customer',
          reference_id: leadId
        },
        {
          auth: {
            username: razorpayKeyId,
            password: razorpayKeySecret
          }
        }
      );

      const contactId = contactResponse.data.id;
      console.log('Contact created:', contactId);

      // Create fund account
      console.log('Creating fund account...');
      const fundAccountResponse = await axios.post(
        'https://api.razorpay.com/v1/fund_accounts',
        {
          contact_id: contactId,
          account_type: 'bank_account',
          bank_account: {
            name: bankDetails.accountHolderName,
            ifsc: bankDetails.ifscCode,
            account_number: bankDetails.accountNumber
          }
        },
        {
          auth: {
            username: razorpayKeyId,
            password: razorpayKeySecret
          }
        }
      );

      const fundAccountId = fundAccountResponse.data.id;
      console.log('Fund account created:', fundAccountId);

      // Create payout (disbursement)
      console.log('Creating payout...');
      const payoutResponse = await axios.post(
        'https://api.razorpay.com/v1/payouts',
        {
          account_number: '2323230032510196', // Your Razorpay account number
          fund_account_id: fundAccountId,
          amount: Math.round(amount * 100), // Convert to paisa
          currency: 'INR',
          mode: 'IMPS', // NEFT, RTGS, IMPS
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: leadId,
          narration: `Loan disbursement for Lead ${leadId}`
        },
        {
          auth: {
            username: razorpayKeyId,
            password: razorpayKeySecret
          }
        }
      );

      console.log('Payout created successfully:', payoutResponse.data);

      return {
        success: true,
        referenceId: payoutResponse.data.id,
        gatewayResponse: {
          id: payoutResponse.data.id,
          status: payoutResponse.data.status,
          amount: payoutResponse.data.amount / 100, // Convert from paisa
          currency: payoutResponse.data.currency,
          created_at: payoutResponse.data.created_at,
          description: payoutResponse.data.narration,
          metadata: {
            leadId,
            contactId,
            fundAccountId,
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            disbursementType: 'loan'
          }
        }
      };

    } catch (error: any) {
      console.error('Razorpay disbursement failed:', error.response?.data || error.message);

      // Handle specific Razorpay errors
      let errorMessage = 'Disbursement failed';
      if (error.response?.data) {
        const razorpayError = error.response.data;
        if (razorpayError.error?.description) {
          errorMessage = razorpayError.error.description;
        } else if (razorpayError.error?.code) {
          errorMessage = `Razorpay Error ${razorpayError.error.code}: ${razorpayError.error.description || razorpayError.error.reason}`;
        }
      }

      return {
        success: false,
        referenceId: '',
        error: errorMessage,
        gatewayResponse: error.response?.data || error
      };
    }
  }

  /**
   * Verify bank details (mock implementation for testing)
   * In production, this would call bank verification APIs
   */
  static async verifyBankDetails(bankDetails: BankTransferDetails): Promise<boolean> {
    try {
      // Simulate bank verification API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For testing, we'll assume verification succeeds if IFSC code is valid format
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      const isValidIfsc = ifscRegex.test(bankDetails.ifscCode);

      return isValidIfsc && bankDetails.accountNumber.length >= 8;
    } catch (error) {
      console.error('Bank verification failed:', error);
      return false;
    }
  }

  /**
   * Get disbursement status from Razorpay
   */
  static async getDisbursementStatus(referenceId: string) {
    try {
      if (!isRazorpayConfigured || referenceId.startsWith('mock-')) {
        return {
          status: referenceId.startsWith('mock-') ? 'processed' : 'unknown',
          amount: 0,
          currency: 'INR',
          created: Math.floor(Date.now() / 1000),
          description: 'Mock disbursement',
          metadata: {}
        };
      }

      const response = await axios.get(
        `https://api.razorpay.com/v1/payouts/${referenceId}`,
        {
          auth: {
            username: razorpayKeyId,
            password: razorpayKeySecret
          }
        }
      );

      return {
        status: response.data.status,
        amount: response.data.amount / 100, // Convert from paisa
        currency: response.data.currency,
        created: response.data.created_at,
        description: response.data.narration,
        metadata: response.data
      };
    } catch (error) {
      console.error('Failed to get disbursement status:', error);
      return null;
    }
  }

  /**
   * Simulate bank account validation
   */
  static validateBankDetails(bankDetails: BankTransferDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Account holder name validation
    if (!bankDetails.accountHolderName || bankDetails.accountHolderName.trim().length < 2) {
      errors.push('Account holder name is required and must be at least 2 characters');
    }

    // Account number validation
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 8) {
      errors.push('Account number is required and must be at least 8 digits');
    }

    // Bank name validation
    if (!bankDetails.bankName || bankDetails.bankName.trim().length < 2) {
      errors.push('Bank name is required');
    }

    // IFSC code validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!bankDetails.ifscCode || !ifscRegex.test(bankDetails.ifscCode)) {
      errors.push('Valid IFSC code is required (format: XXXX0XXXXXX)');
    }

    // Account type validation
    if (!bankDetails.accountType || !['savings', 'current'].includes(bankDetails.accountType)) {
      errors.push('Account type must be either savings or current');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
