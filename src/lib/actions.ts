'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from './definitions';

const SESSION_COOKIE_NAME = 'justtry_session';

export async function login(role: UserRole) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ role }), {
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
  } catch (err) {
    console.error('Error setting session cookie:', err);
  }
  return { success: true, role };
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    console.error('Error removing session cookie:', err);
  }
  return { success: true };
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
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
