import type { APIRoute } from 'astro';
import { destroySession, SESSION_COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const ALL: APIRoute = async ({ cookies, redirect }) => {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await destroySession(sessionId);
  }

  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });

  return redirect('/admin/login');
};
