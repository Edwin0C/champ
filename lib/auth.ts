import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SessionUser, User } from './types';
import { getAdminSupabase } from './supabase/server';

const COOKIE_NAME = 'champions_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSession(user: User) {
  const sessionData: SessionUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    nombre: user.nombre,
    apellido: user.apellido,
    phone: user.phone,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.id)
    .single();

  if (error || !data || data.is_disabled) {
    return null;
  }

  return data as User;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
