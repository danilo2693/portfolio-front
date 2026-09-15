import { defineMiddleware } from 'astro:middleware';
import { validateSession, isSetupNeeded, SESSION_COOKIE_NAME } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return next();
  }

  const sessionId = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionResult = sessionId ? await validateSession(sessionId) : null;
  const currentUser = sessionResult?.user || null;
  context.locals.user = currentUser;

  const needsSetup = await isSetupNeeded();

  // API route protection
  if (isAdminApi) {
    if (pathname === '/api/admin/setup') {
      return next();
    }
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return next();
  }

  // Admin pages protection
  if (pathname === '/admin/setup') {
    if (!needsSetup) {
      return context.redirect('/admin/login');
    }
    return next();
  }

  if (pathname === '/admin/login') {
    if (needsSetup) {
      return context.redirect('/admin/setup');
    }
    if (currentUser) {
      return context.redirect('/admin');
    }
    return next();
  }

  // All other /admin routes require setup completed & authenticated user
  if (needsSetup) {
    return context.redirect('/admin/setup');
  }

  if (!currentUser) {
    return context.redirect(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return next();
});
