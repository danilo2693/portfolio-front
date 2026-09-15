import type { APIRoute } from 'astro';
import { prisma } from '../../lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos (nombre, correo y mensaje) son requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        message: String(message).trim(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, data: newMessage }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving contact message to PostgreSQL:', error);
    return new Response(
      JSON.stringify({ error: 'Error al enviar el mensaje. Por favor intenta de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
