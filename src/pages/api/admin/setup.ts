import type { APIRoute } from 'astro';
import { isSetupNeeded, hashPassword, createSession, SESSION_COOKIE_NAME } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const needsSetup = await isSetupNeeded();
    if (!needsSetup) {
      return new Response(
        JSON.stringify({ error: 'El registro inicial ya fue completado.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Nombre, correo y contraseña son requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        role: 'admin',
      },
    });

    // Update Profile default email and name if not set
    try {
      await prisma.profile.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          name: user.name,
          email: user.email,
        },
        update: {
          name: user.name,
          email: user.email,
        },
      });
    } catch {
      // ignore
    }

    // Create active session
    const sessionId = await createSession(user.id);

    cookies.set(SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Administrador configurado con éxito.' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error during admin setup:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al registrar el administrador inicial.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
