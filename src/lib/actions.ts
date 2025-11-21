'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from './definitions';

const SESSION_COOKIE_NAME = 'justtry_session';

export async function login(role: UserRole) {
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify({ role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/');
}

export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}
