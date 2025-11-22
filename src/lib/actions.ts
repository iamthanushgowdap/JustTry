'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from './definitions';
import { createServerClient } from '@supabase/ssr';

const SESSION_COOKIE_NAME = 'justtry_session';

export async function login(role: UserRole) {
  (await cookies()).set(SESSION_COOKIE_NAME, JSON.stringify({ role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  await supabase.auth.signOut();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/');
}

export async function getSession() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);
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
