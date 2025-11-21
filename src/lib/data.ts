'use client';

import { Lead, User, UserRole } from './definitions';

const initialUsers: User[] = [
  { id: '1', name: 'Alex Sales', role: 'sales', avatar: 'https://i.pravatar.cc/40?u=alex' },
  { id: '2', name: 'Betty Office', role: 'back-office', avatar: 'https://i.pravatar.cc/40?u=betty' },
  { id: '3', name: 'Charlie Admin', role: 'admin', avatar: 'https://i.pravatar.cc/40?u=charlie' },
];

const initialLeads: Lead[] = [
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

const isBrowser = typeof window !== 'undefined';

function getFromStorage<T>(key: string, initialData: T): T {
  if (!isBrowser) return initialData;
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue);
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage`, error);
      return initialData;
    }
  }
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
}

function saveToStorage<T>(key: string, data: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
}


export function getUsers(): User[] {
    return getFromStorage('users', initialUsers);
}

export function getUser(role: UserRole): User {
  const users = getUsers();
  return users.find((user) => user.role === role) || users[0];
}

export function saveUsers(users: User[]) {
    saveToStorage('users', users);
}

export function getLeads(): Lead[] {
    return getFromStorage('leads', initialLeads);
}

export function saveLeads(leads: Lead[]) {
    saveToStorage('leads', leads);
}
