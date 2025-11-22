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
} as const;
export type LoanPipelineStatus = (typeof LoanPipelineStatus)[keyof typeof LoanPipelineStatus];

export const InvestmentPipelineStatus = {
    New: 'New',
    RiskProfiling: 'Risk Profiling',
    KYCVerification: 'KYC Verification',
    InvestmentPlanning: 'Investment Planning',
    PortfolioCreation: 'Portfolio Creation',
    Activated: 'Activated',
} as const;
export type InvestmentPipelineStatus = (typeof InvestmentPipelineStatus)[keyof typeof InvestmentPipelineStatus];

export const InsurancePipelineStatus = {
    New: 'New',
    KYCPending: 'KYC Pending',
    MedicalCheck: 'Medical Check',
    Underwriting: 'Underwriting',
    ApprovedRejected: 'Approved / Rejected',
    PolicyIssued: 'Policy Issued',
} as const;
export type InsurancePipelineStatus = (typeof InsurancePipelineStatus)[keyof typeof InsurancePipelineStatus];

export type PipelineStatus = LoanPipelineStatus | InvestmentPipelineStatus | InsurancePipelineStatus;

export type Document = {
    name: string;
    url: string;
};

export type LeadHistory = {
    status: PipelineStatus | string;
    timestamp: string;
    user: string;
    remarks?: string;
    cibilData?: any; // Optional CIBIL score data
}

export type BankDetails = {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'savings' | 'current';
  verifiedBy?: string; // User ID who verified
  verifiedAt?: string;
};

export type Disbursement = {
  id: string;
  amount: number;
  referenceId: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  initiatedBy: string; // User ID
  initiatedAt: string;
  completedAt?: string;
  failureReason?: string;
  gatewayResponse?: any;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
  subCategory: LoanSubCategory | InvestmentSubCategory | InsuranceSubCategory;
  status: string; // Changed from PipelineStatus to string to match database schema
  value: number;
  assignedTo: string;
  createdAt: string;
  updatedAt?: string;
  documents?: Document[];
  history?: LeadHistory[];
  bankDetails?: BankDetails;
  disbursements?: Disbursement[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  joinDate?: string;
  manager?: string;
  serviceTypes?: ServiceType[]; // For back-office users to specify which service types they handle
};
