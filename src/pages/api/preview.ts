import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, redirect, cookies }) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const redirectUrl = url.searchParams.get('url');
  const status = url.searchParams.get('status');

  // Verify the secret against your environment variable.
  if (secret !== import.meta.env.PREVIEW_SECRET) {
    return new Response('<h1>Invalid token</h1>', { 
      status: 401,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }

  // Set a cookie to enable preview mode for draft content
  if (status === 'draft') {
    cookies.set('preview_mode', 'true', { path: '/', httpOnly: true });
  } else {
    cookies.delete('preview_mode', { path: '/' });
  }

  // Redirect to the appropriate URL
  return redirect(redirectUrl || '/');
};
