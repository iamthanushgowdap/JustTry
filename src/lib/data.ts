import { Lead, User, UserRole } from './definitions';

export const users: User[] = [
  { id: '1', name: 'Alex Sales', role: 'sales', avatar: 'https://i.pravatar.cc/40?u=alex' },
  { id: '2', name: 'Betty Office', role: 'back-office', avatar: 'https://i.pravatar.cc/40?u=betty' },
  { id: '3', name: 'Charlie Admin', role: 'admin', avatar: 'https://i.pravatar.cc/40?u=charlie' },
];

export const getUser = (role: UserRole) => {
  return users.find((user) => user.role === role) || users[0];
};

export const leads: Lead[] = [
  {
    id: 'LEAD-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-202-555-0104',
    serviceType: 'Loan',
    subCategory: 'Personal Loan',
    status: 'New',
    value: 50000,
    assignedTo: 'Alex Sales',
    createdAt: '2024-07-28',
  },
  {
    id: 'LEAD-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-202-555-0168',
    serviceType: 'Investment',
    subCategory: 'SIP/Mutual Funds',
    status: 'Risk Profiling',
    value: 120000,
    assignedTo: 'Alex Sales',
    createdAt: '2024-07-27',
  },
  {
    id: 'LEAD-003',
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    phone: '+1-202-555-0182',
    serviceType: 'Insurance',
    subCategory: 'Health Insurance',
    status: 'KYC Pending',
    value: 75000,
    assignedTo: 'Alex Sales',
    createdAt: '2024-07-26',
  },
  {
    id: 'LEAD-004',
    name: 'Mary Williams',
    email: 'mary.williams@example.com',
    phone: '+1-202-555-0151',
    serviceType: 'Loan',
    subCategory: 'Home Loan',
    status: 'Eligibility Check',
    value: 350000,
    assignedTo: 'Alex Sales',
    createdAt: '2024-07-25',
  },
  {
    id: 'LEAD-005',
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1-202-555-0199',
    serviceType: 'Investment',
    subCategory: 'Stocks/Demat',
    status: 'Activated',
    value: 250000,
    assignedTo: 'Alex Sales',
    createdAt: '2024-07-24',
  },
];
