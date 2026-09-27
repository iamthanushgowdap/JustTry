'use client';

import { Lead, User, UserRole, Task, FollowUp, Document } from './definitions';

export const initialUsers: User[] = [
  { id: '1', name: 'Alex Sales', role: 'sales', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', email: 'alex.sales@justtry.fin', department: 'Retail Loans & Wealth' },
  { id: '2', name: 'Betty Office', role: 'back-office', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', email: 'betty.office@justtry.fin', department: 'Risk & Compliance' },
  { id: '3', name: 'Charlie Admin', role: 'admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', email: 'charlie.admin@justtry.fin', department: 'Executive Management' },
];

export const initialLeads: Lead[] = [
  {
    id: 'LEAD-101',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98201 12345',
    serviceType: 'Loan',
    subCategory: 'Home Loan',
    status: 'Documents Needed',
    value: 450000,
    assignedTo: 'Alex Sales',
    companyName: 'Tech Innovations Ltd',
    annualIncome: 120000,
    panOrId: 'ABCPS1234F',
    createdAt: '2026-09-20T10:30:00Z',
    notes: 'Looking for prime rate home loan with 20 year tenure.',
    documents: [
      { id: 'doc-1', name: 'Salary_Slip_3Months.pdf', url: 'https://placehold.co/600x400/png?text=Salary+Slips', uploadedAt: '2026-09-21T11:00:00Z', status: 'Verified', verifiedBy: 'Betty Office' },
      { id: 'doc-2', name: 'Property_Sale_Agreement.pdf', url: 'https://placehold.co/600x400/png?text=Property+Sale+Agreement', uploadedAt: '2026-09-22T09:15:00Z', status: 'Pending' },
    ],
    history: [
      { status: 'New', timestamp: '2026-09-20T10:30:00Z', user: 'Alex Sales', remarks: 'Customer inquiry received via web portal.' },
      { status: 'KYC Pending', timestamp: '2026-09-21T10:00:00Z', user: 'Alex Sales', remarks: 'Initiated KYC documentation process.' },
      { status: 'Documents Needed', timestamp: '2026-09-22T09:30:00Z', user: 'Betty Office', remarks: 'Awaiting 6 months bank statement and property NOC.' },
    ],
  },
  {
    id: 'LEAD-102',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@acmecorp.in',
    phone: '+91 98450 67890',
    serviceType: 'Loan',
    subCategory: 'Business Loan',
    status: 'Eligibility Check',
    value: 1200000,
    assignedTo: 'Alex Sales',
    companyName: 'Apex Logistics & Freight',
    annualIncome: 350000,
    panOrId: 'BJKRP5678G',
    createdAt: '2026-09-15T14:20:00Z',
    notes: 'Working capital expansion for new regional warehouse fleet.',
    documents: [
      { id: 'doc-3', name: 'GST_Filings_FY25.pdf', url: 'https://placehold.co/600x400/png?text=GST+Returns', uploadedAt: '2026-09-17T12:00:00Z', status: 'Verified', verifiedBy: 'Betty Office' },
      { id: 'doc-4', name: 'Audited_Balance_Sheet.pdf', url: 'https://placehold.co/600x400/png?text=Audited+Financials', uploadedAt: '2026-09-18T15:30:00Z', status: 'Verified', verifiedBy: 'Betty Office' },
      { id: 'doc-5', name: 'Director_PAN_Aadhaar.pdf', url: 'https://placehold.co/600x400/png?text=Director+KYC', uploadedAt: '2026-09-19T09:00:00Z', status: 'Pending' },
    ],
    history: [
      { status: 'New', timestamp: '2026-09-15T14:20:00Z', user: 'Alex Sales', remarks: 'Corporate lead generated from seminar.' },
      { status: 'KYC Pending', timestamp: '2026-09-17T10:00:00Z', user: 'Betty Office', remarks: 'Corporate documents verified.' },
      { status: 'Eligibility Check', timestamp: '2026-09-23T11:45:00Z', user: 'Betty Office', remarks: 'Underwriting committee review in progress.' },
    ],
  },
  {
    id: 'LEAD-103',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@fintechpro.com',
    phone: '+91 97112 34567',
    serviceType: 'Investment',
    subCategory: 'SIP/Mutual Funds',
    status: 'Investment Planning',
    value: 85000,
    assignedTo: 'Alex Sales',
    annualIncome: 95000,
    panOrId: 'CLWAD9012K',
    createdAt: '2026-09-18T08:45:00Z',
    notes: 'Wants aggressive equity growth portfolio with monthly SIP of $1,500.',
    documents: [
      { id: 'doc-6', name: 'PAN_Card.pdf', url: 'https://placehold.co/600x400/png?text=PAN+Card', uploadedAt: '2026-09-19T10:00:00Z', status: 'Verified', verifiedBy: 'Betty Office' },
      { id: 'doc-7', name: 'Bank_Proof_Cancelled_Cheque.pdf', url: 'https://placehold.co/600x400/png?text=Cancelled+Cheque', uploadedAt: '2026-09-19T10:05:00Z', status: 'Verified', verifiedBy: 'Betty Office' },
    ],
    history: [
      { status: 'New', timestamp: '2026-09-18T08:45:00Z', user: 'Alex Sales', remarks: 'Lead added from referrals.' },
      { status: 'Risk Profiling', timestamp: '2026-09-19T16:00:00Z', user: 'Alex Sales', remarks: 'Risk score evaluated as High / Growth.' },
      { status: 'KYC Verification', timestamp: '2026-09-20T11:00:00Z', user: 'Betty Office', remarks: 'CVL-KRA verified successfully.' },
      { status: 'Investment Planning', timestamp: '2026-09-22T14:30:00Z', user: 'Alex Sales', remarks: 'Formulated 5-fund diversified portfolio.' },
    ],
  },
  {
    id: 'LEAD-104',
    name: 'Vikram Sengupta',
    email: 'vikram.sengupta@metropolitan.org',
    phone: '+91 99304 88765',
    serviceType: 'Insurance',
    subCategory: 'Health Insurance',
    status: 'Medical Check',
    value: 45000,
    assignedTo: 'Alex Sales',
    annualIncome: 80000,
    panOrId: 'DPWVS3456L',
    createdAt: '2026-09-12T16:00:00Z',
    notes: 'Family floater plan covering spouse and 2 children with OPD cover.',
    documents: [
      { id: 'doc-8', name: 'Aadhaar_Cards_Family.pdf', url: 'https://placehold.co/600x400/png?text=Family+Aadhaar', uploadedAt: '2026-09-14T11:00:00Z', status: 'Verified', verifiedBy: 'Betty Office' },
      { id: 'doc-9', name: 'Diagnostic_Report_MER.pdf', url: 'https://placehold.co/600x400/png?text=Medical+Diagnostic+Report', uploadedAt: '2026-09-23T14:00:00Z', status: 'Pending' },
    ],
    history: [
      { status: 'New', timestamp: '2026-09-12T16:00:00Z', user: 'Alex Sales', remarks: 'Inbound request for comprehensive health cover.' },
      { status: 'KYC Pending', timestamp: '2026-09-14T11:30:00Z', user: 'Alex Sales', remarks: 'Collected proposer IDs.' },
      { status: 'Medical Check', timestamp: '2026-09-21T09:00:00Z', user: 'Betty Office', remarks: 'Tele-MER and health screening scheduled.' },
    ],
  },
];

export const initialTasks: Task[] = [
  {
    id: 'TASK-1',
    title: 'Verify Property Title Deed & NOC',
    description: 'Review legal scrutiny report and clearance certificate for Priya Sharma (LEAD-101).',
    leadId: 'LEAD-101',
    leadName: 'Priya Sharma',
    serviceType: 'Loan',
    dueDate: '2026-09-29',
    priority: 'high',
    completed: false,
    assignedTo: 'Betty Office',
    createdAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'TASK-2',
    title: 'Review Tele-MER Medical Diagnostic Report',
    description: 'Check ECG and blood profile clearance for Vikram Sengupta (LEAD-104) underwriter approval.',
    leadId: 'LEAD-104',
    leadName: 'Vikram Sengupta',
    serviceType: 'Insurance',
    dueDate: '2026-09-30',
    priority: 'medium',
    completed: false,
    assignedTo: 'Betty Office',
    createdAt: '2026-09-24T09:30:00Z',
  },
  {
    id: 'TASK-3',
    title: 'Finalize Mutual Fund Asset Allocation',
    description: 'Prepare customized SIP mandate and scheme allocation sheet for Ananya Deshmukh (LEAD-103).',
    leadId: 'LEAD-103',
    leadName: 'Ananya Deshmukh',
    serviceType: 'Investment',
    dueDate: '2026-09-28',
    priority: 'low',
    completed: true,
    assignedTo: 'Alex Sales',
    createdAt: '2026-09-22T15:00:00Z',
  },
];

export const initialFollowUps: FollowUp[] = [
  {
    id: 'FU-1',
    leadId: 'LEAD-101',
    leadName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98201 12345',
    serviceType: 'Loan',
    date: '2026-09-29',
    time: '11:00 AM',
    notes: 'Collect signed builder agreement copy and discuss final interest rate concession.',
    type: 'Call',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
    createdAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'FU-2',
    leadId: 'LEAD-102',
    leadName: 'Rajesh Patel',
    email: 'rajesh.patel@acmecorp.in',
    phone: '+91 98450 67890',
    serviceType: 'Loan',
    date: '2026-09-28',
    time: '03:30 PM',
    notes: 'Finalize corporate loan disbursement schedule and verify signing authority.',
    type: 'Meeting',
    status: 'Completed',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    createdAt: '2026-09-20T16:00:00Z',
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

// ----------------- USERS -----------------
export function getUsers(): User[] {
  return getFromStorage('users', initialUsers);
}

export function getUser(role: UserRole): User | null {
  const users = getUsers();
  return users.find((user) => user.role === role) || users[0] || null;
}

export function saveUsers(users: User[]) {
  saveToStorage('users', users);
}

// ----------------- LEADS -----------------
export function getLeads(): Lead[] {
  return getFromStorage('leads', initialLeads);
}

export function getLead(id: string): Lead | null {
  const leads = getLeads();
  return leads.find(l => l.id === id) || null;
}

export function saveLeads(leads: Lead[]) {
  saveToStorage('leads', leads);
}

export function addLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Lead {
  const leads = getLeads();
  const timestamp = new Date().toISOString();
  const newLead: Lead = {
    ...leadData,
    id: `LEAD-${Date.now()}`,
    createdAt: timestamp,
    history: [
      {
        status: leadData.status,
        timestamp,
        user: leadData.assignedTo || 'Current User',
        remarks: 'Lead created in CRM.',
      },
    ],
  };
  const updated = [newLead, ...leads];
  saveLeads(updated);
  return newLead;
}

export function updateLead(updatedLead: Lead): Lead {
  const leads = getLeads();
  const updated = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
  saveLeads(updated);
  return updatedLead;
}

export function deleteLead(id: string) {
  const leads = getLeads();
  const updated = leads.filter(l => l.id !== id);
  saveLeads(updated);
  // Also clean up linked tasks and follow-ups
  const tasks = getTasks().filter(t => t.leadId !== id);
  saveTasks(tasks);
  const followUps = getFollowUps().filter(f => f.leadId !== id);
  saveFollowUps(followUps);
}

// ----------------- TASKS -----------------
export function getTasks(): Task[] {
  return getFromStorage('tasks', initialTasks);
}

export function saveTasks(tasks: Task[]) {
  saveToStorage('tasks', tasks);
}

export function addTask(taskData: Omit<Task, 'id' | 'createdAt'>): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...taskData,
    id: `TASK-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newTask, ...tasks];
  saveTasks(updated);
  return newTask;
}

export function toggleTask(id: string): Task | null {
  const tasks = getTasks();
  let toggled: Task | null = null;
  const updated = tasks.map(t => {
    if (t.id === id) {
      toggled = { ...t, completed: !t.completed };
      return toggled;
    }
    return t;
  });
  saveTasks(updated);
  return toggled;
}

export function deleteTask(id: string) {
  const tasks = getTasks();
  const updated = tasks.filter(t => t.id !== id);
  saveTasks(updated);
}

// ----------------- FOLLOW-UPS -----------------
export function getFollowUps(): FollowUp[] {
  return getFromStorage('follow_ups', initialFollowUps);
}

export function saveFollowUps(followUps: FollowUp[]) {
  saveToStorage('follow_ups', followUps);
}

export function addFollowUp(fuData: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
  const followUps = getFollowUps();
  const newFollowUp: FollowUp = {
    ...fuData,
    id: `FU-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newFollowUp, ...followUps];
  saveFollowUps(updated);
  return newFollowUp;
}

export function toggleFollowUpStatus(id: string): FollowUp | null {
  const followUps = getFollowUps();
  let toggled: FollowUp | null = null;
  const updated = followUps.map(f => {
    if (f.id === id) {
      toggled = {
        ...f,
        status: f.status === 'Completed' ? 'Pending' : 'Completed',
      };
      return toggled;
    }
    return f;
  });
  saveFollowUps(updated);
  return toggled;
}

export function deleteFollowUp(id: string) {
  const followUps = getFollowUps();
  const updated = followUps.filter(f => f.id !== id);
  saveFollowUps(updated);
}

// ----------------- RESET / DEMO DATA -----------------
export function resetToDemoData() {
  if (!isBrowser) return;
  localStorage.setItem('users', JSON.stringify(initialUsers));
  localStorage.setItem('leads', JSON.stringify(initialLeads));
  localStorage.setItem('tasks', JSON.stringify(initialTasks));
  localStorage.setItem('follow_ups', JSON.stringify(initialFollowUps));
}