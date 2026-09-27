/**
 * @fileOverview Automatically suggests a list of tasks to complete for each lead in the pipeline.
 * Fully self-contained with intelligent rule-based AI task engine that works 100% offline
 * without requiring external API keys.
 */

export type SuggestTasksInput = {
  leadName: string;
  serviceType: 'Loan' | 'Investment' | 'Insurance';
  leadStatus: string;
  leadData?: string;
  subCategory?: string;
};

export type SuggestTasksOutput = {
  tasks: string[];
};

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  const { leadName, serviceType, leadStatus, subCategory = '' } = input;
  const tasks: string[] = [];

  // Service-specific intelligent AI task recommendations based on status
  if (serviceType === 'Loan') {
    switch (leadStatus) {
      case 'New':
        tasks.push(
          `Initiate introductory discovery call with ${leadName} to assess borrowing requirement and loan tenure`,
          `Collect primary KYC documents (Aadhaar, PAN, and current address proof)`,
          `Check initial credit score eligibility criteria for ${subCategory || 'loan'}`
        );
        break;
      case 'KYC Pending':
        tasks.push(
          `Follow up with ${leadName} for pending PAN & biometric Aadhaar verification`,
          `Validate applicant signature against government ID proofs`,
          `Verify residential address via geo-tagged utility bill or field verification`
        );
        break;
      case 'Documents Needed':
        tasks.push(
          `Request last 3 months salary slips or last 2 years audited ITR/computation`,
          `Obtain last 6 months bank statement showing regular income credits`,
          subCategory === 'Home Loan'
            ? `Collect builder buyer agreement, title search report & NOC from society`
            : subCategory === 'Business Loan'
            ? `Collect GST filing returns (GSTR-3B & GSTR-1) and business vintage proof`
            : `Collect vehicle quotation / proforma invoice from authorized dealership`
        );
        break;
      case 'Eligibility Check':
        tasks.push(
          `Run automated CIBIL / Experian credit bureau pull and review repayment history`,
          `Calculate Fixed Obligation to Income Ratio (FOIR) and Debt-to-Income (DTI)`,
          `Prepare credit assessment memo for loan underwriting sanction committee`
        );
        break;
      case 'Approved':
        tasks.push(
          `Issue digital sanction letter with APR, EMI schedule, and processing fee breakdown`,
          `Execute e-Stamp and digital loan agreement via Aadhaar e-Sign`,
          `Set up National Automated Clearing House (NACH) mandate for auto-debit of EMIs`
        );
        break;
      case 'Completed':
        tasks.push(
          `Initiate NEFT/RTGS loan disbursement to borrower / seller verified bank account`,
          `Dispatch welcome kit with loan account number and repayment schedule`,
          `Schedule 30-day post-disbursement customer satisfaction check`
        );
        break;
      default:
        tasks.push(
          `Review loan pipeline status for ${leadName}`,
          `Verify all compliance checklists are satisfied`
        );
    }
  } else if (serviceType === 'Investment') {
    switch (leadStatus) {
      case 'New':
        tasks.push(
          `Schedule financial goal-setting consultation with ${leadName}`,
          `Send digital onboarding link to collect KYC and demat details`,
          `Determine investment horizon (short-term, mid-term, or retirement)`
        );
        break;
      case 'Risk Profiling':
        tasks.push(
          `Administer SEBI risk tolerance questionnaire to determine risk appetite`,
          `Evaluate liquidity requirements and existing asset allocation`,
          `Classify investor profile (Conservative, Balanced, or Aggressive Growth)`
        );
        break;
      case 'KYC Verification':
        tasks.push(
          `Run CVL / CAMS KRA digital verification for PAN and address`,
          `Perform In-Person Verification (IPV) or video KYC verification`,
          `Validate penny drop test to verify active bank account details`
        );
        break;
      case 'Investment Planning':
        tasks.push(
          `Formulate tailored asset allocation model (Equity vs Debt vs Liquid)`,
          `Select top quartile mutual funds / index ETFs matching risk profile`,
          `Present investment proposal and backtested historical performance to ${leadName}`
        );
        break;
      case 'Portfolio Creation':
        tasks.push(
          `Register SIP auto-debit OTM mandate with customer's linked bank account`,
          `Execute initial lump sum or first SIP installment transactions on exchange`,
          `Generate Consolidated Account Statement (CAS) baseline for tracking`
        );
        break;
      case 'Activated':
      case 'Completed':
        tasks.push(
          `Deliver digital portfolio dashboard access and login credentials to ${leadName}`,
          `Schedule quarterly portfolio rebalancing and tax-loss harvesting review`,
          `Offer tax-saving ELSS / NPS supplementary investment options`
        );
        break;
      default:
        tasks.push(
          `Review investment status and asset performance for ${leadName}`,
          `Check portfolio health metrics and asset weightings`
        );
    }
  } else if (serviceType === 'Insurance') {
    switch (leadStatus) {
      case 'New':
        tasks.push(
          `Conduct needs analysis to determine adequate sum insured for ${leadName}`,
          `Compare policy options, riders (Critical Illness, Accidental Disability), and copays`,
          `Share premium quotation comparison chart with benefits summary`
        );
        break;
      case 'KYC Pending':
        tasks.push(
          `Collect proposer and insured member photo identification and age proof`,
          `Verify pre-existing medical declaration questionnaire signed by ${leadName}`,
          `Verify CKYC compliance in IRDAI registry`
        );
        break;
      case 'Medical Check':
        tasks.push(
          `Schedule at-home paramedical screening (MER, ECG, Lipid profile, HbA1c)`,
          `Follow up with diagnostic lab for medical test reports upload`,
          `Review diagnostic reports with in-house medical underwriter`
        );
        break;
      case 'Underwriting':
        tasks.push(
          `Submit file to insurer underwriting team for mortality and morbidity assessment`,
          `Review any counter-offers, underwriting loadings, or policy exclusions`,
          `Communicate final terms or loading consent form to ${leadName}`
        );
        break;
      case 'Policy Issued':
      case 'Completed':
        tasks.push(
          `Verify issuance of digital policy bond with correct nomination details`,
          `Deliver e-Insurance Account (eIA) policy copy and cashless hospital network list`,
          `Set up annual policy renewal reminder alert for ${leadName}`
        );
        break;
      default:
        tasks.push(
          `Review insurance pipeline status for ${leadName}`,
          `Check policy document compliance`
        );
    }
  } else {
    tasks.push(
      `Contact ${leadName} to confirm requirements`,
      `Collect required identity documentation`,
      `Update lead status in CRM`
    );
  }

  return { tasks };
}
