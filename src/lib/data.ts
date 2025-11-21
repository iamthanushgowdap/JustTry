'use client';

import { Lead, User, UserRole } from './definitions';

const initialUsers: User[] = [
  { id: '1', name: 'Alex Sales', role: 'sales', avatar: 'https://i.pravatar.cc/40?u=alex' },
  { id: '2', name: 'Betty Office', role: 'back-office', avatar: 'https://i.pravatar.cc/40?u=betty' },
  { id: '3', name: 'Charlie Admin', role: 'admin', avatar: 'https://i.pravatar.cc/40?u=charlie' },
];

const initialLeads: Lead[] = [];

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

// To clear data, we can remove it from localStorage.
// The next time getFromStorage is called, it will use the (now empty) initialData.
if (isBrowser) {
    localStorage.removeItem('leads');
}


export function getUsers(): User[] {
    return getFromStorage('users', initialUsers);
}

export function getUser(role: UserRole): User | null {
  const users = getUsers();
  return users.find((user) => user.role === role) || null;
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