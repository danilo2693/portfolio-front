import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: 'default' },
    });

    return new Response(JSON.stringify({ success: true, profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al obtener perfil.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      summary,
      description,
      avatarUrl,
      avatarPublicId,
      cvUrl,
      cvPublicId,
      links,
    } = body;

    const updated = await prisma.profile.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        name: String(name || 'Danilo').trim(),
        email: String(email || '').trim(),
        phone: phone || null,
        summary: summary || null,
        description: description || null,
        avatarUrl: avatarUrl || null,
        avatarPublicId: avatarPublicId || null,
        cvUrl: cvUrl || null,
        cvPublicId: cvPublicId || null,
        links: links || [],
      },
      update: {
        name: String(name || 'Danilo').trim(),
        email: String(email || '').trim(),
        phone: phone || null,
        summary: summary || null,
        description: description || null,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        avatarPublicId: avatarPublicId !== undefined ? avatarPublicId : undefined,
        cvUrl: cvUrl !== undefined ? cvUrl : undefined,
        cvPublicId: cvPublicId !== undefined ? cvPublicId : undefined,
        links: links || [],
      },
    });

    return new Response(JSON.stringify({ success: true, profile: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al actualizar perfil.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
