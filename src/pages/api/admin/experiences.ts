import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    return new Response(JSON.stringify({ success: true, experiences }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching admin experiences:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al obtener experiencias.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      title,
      companyName,
      periodTime,
      description,
      orderIndex = 0,
      enabled = true,
      locale = 'all',
    } = body;

    if (!title || !companyName || !periodTime) {
      return new Response(
        JSON.stringify({ error: 'Título, empresa y periodo son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const exp = await prisma.experience.create({
      data: {
        title: String(title).trim(),
        companyName: String(companyName).trim(),
        periodTime: String(periodTime).trim(),
        description: description || null,
        orderIndex: Number(orderIndex) || 0,
        enabled: Boolean(enabled),
        locale: locale || 'all',
      },
    });

    return new Response(JSON.stringify({ success: true, experience: exp }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating experience:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al crear la experiencia.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      id,
      title,
      companyName,
      periodTime,
      description,
      orderIndex = 0,
      enabled = true,
      locale = 'all',
    } = body;

    if (!id || !title || !companyName || !periodTime) {
      return new Response(
        JSON.stringify({ error: 'ID, título, empresa y periodo son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updated = await prisma.experience.update({
      where: { id },
      data: {
        title: String(title).trim(),
        companyName: String(companyName).trim(),
        periodTime: String(periodTime).trim(),
        description: description || null,
        orderIndex: Number(orderIndex) || 0,
        enabled: Boolean(enabled),
        locale: locale || 'all',
      },
    });

    return new Response(JSON.stringify({ success: true, experience: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating experience:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al actualizar la experiencia.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de experiencia requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.experience.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error deleting experience:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al eliminar la experiencia.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
