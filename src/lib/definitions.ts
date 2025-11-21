export const UserRole = {
    Sales: 'sales',
    BackOffice: 'back-office',
    Admin: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ServiceType = {
    Loan: 'Loan',
    Investment: 'Investment',
    Insurance: 'Insurance',
} as const;
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const LoanSubCategory = {
    Personal: 'Personal Loan',
    Business: 'Business Loan',
    Home: 'Home Loan',
    Vehicle: 'Vehicle Loan',
} as const;
export type LoanSubCategory = (typeof LoanSubCategory)[keyof typeof LoanSubCategory];

export const InvestmentSubCategory = {
    SIP: 'SIP/Mutual Funds',
    Stocks: 'Stocks/Demat',
    FD: 'Fixed Deposits',
    Bonds: 'Bonds',
} as const;
export type InvestmentSubCategory = (typeof InvestmentSubCategory)[keyof typeof InvestmentSubCategory];

export const InsuranceSubCategory = {
    Health: 'Health Insurance',
    Life: 'Life Insurance',
    Vehicle: 'Vehicle Insurance',
    Term: 'Term Plans',
} as const;
export type InsuranceSubCategory = (typeof InsuranceSubCategory)[keyof typeof InsuranceSubCategory];

export const LoanPipelineStatus = {
    New: 'New',
    KYCPending: 'KYC Pending',
    DocumentsNeeded: 'Documents Needed',
    EligibilityCheck: 'Eligibility Check',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Completed: 'Completed',
} as const;
export type LoanPipelineStatus = (typeof LoanPipelineStatus)[keyof typeof LoanPipelineStatus];

export const InvestmentPipelineStatus = {
    New: 'New',
    RiskProfiling: 'Risk Profiling',
    KYCVerification: 'KYC Verification',
    InvestmentPlanning: 'Investment Planning',
    PortfolioCreation: 'Portfolio Creation',
    Activated: 'Activated',
    Completed: 'Completed',
} as const;
export type InvestmentPipelineStatus = (typeof InvestmentPipelineStatus)[keyof typeof InvestmentPipelineStatus];

export const InsurancePipelineStatus = {
    New: 'New',
    KYCPending: 'KYC Pending',
    MedicalCheck: 'Medical Check',
    Underwriting: 'Underwriting',
    ApprovedRejected: 'Approved / Rejected',
    PolicyIssued: 'Policy Issued',
    Completed: 'Completed',
} as const;
export type InsurancePipelineStatus = (typeof InsurancePipelineStatus)[keyof typeof InsurancePipelineStatus];

export type PipelineStatus = LoanPipelineStatus | InvestmentPipelineStatus | InsurancePipelineStatus;

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
  subCategory: LoanSubCategory | InvestmentSubCategory | InsuranceSubCategory;
  status: PipelineStatus;
  value: number;
  assignedTo: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
};
