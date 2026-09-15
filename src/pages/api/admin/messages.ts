import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify({ success: true, messages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching admin messages:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al obtener mensajes.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de mensaje requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: Boolean(isRead) },
    });

    return new Response(JSON.stringify({ success: true, message: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating message status:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al actualizar mensaje.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de mensaje requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al eliminar el mensaje.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
