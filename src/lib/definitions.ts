export type UserRole = 'sales' | 'back-office' | 'admin';

export type ServiceType = 'Loan' | 'Investment' | 'Insurance';

export type LoanSubCategory = 'Personal Loan' | 'Business Loan' | 'Home Loan' | 'Vehicle Loan';
export type InvestmentSubCategory = 'SIP/Mutual Funds' | 'Stocks/Demat' | 'Fixed Deposits' | 'Bonds';
export type InsuranceSubCategory = 'Health Insurance' | 'Life Insurance' | 'Vehicle Insurance' | 'Term Plans';

export type LoanPipelineStatus =
  | 'New'
  | 'KYC Pending'
  | 'Documents Needed'
  | 'Eligibility Check'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export type InvestmentPipelineStatus =
  | 'New'
  | 'Risk Profiling'
  | 'KYC Verification'
  | 'Investment Planning'
  | 'Portfolio Creation'
  | 'Activated'
  | 'Completed';

export type InsurancePipelineStatus =
  | 'New'
  | 'KYC Pending'
  | 'Medical Check'
  | 'Underwriting'
  | 'Approved / Rejected'
  | 'Policy Issued'
  | 'Completed';

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
