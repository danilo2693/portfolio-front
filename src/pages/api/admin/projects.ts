import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { deleteFromCloudinary } from '../../../lib/cloudinary';

export const prerender = false;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const GET: APIRoute = async () => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return new Response(JSON.stringify({ success: true, projects }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching admin projects:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al obtener proyectos.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      title,
      slug: customSlug,
      description,
      siteUrl,
      githubUrl,
      stack = [],
      featured = false,
      enabled = true,
      orderIndex = 0,
      locale = 'all',
      photos = [],
    } = body;

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'El título del proyecto es obligatorio.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let slug = customSlug ? generateSlug(customSlug) : generateSlug(title);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const project = await prisma.project.create({
      data: {
        title: String(title).trim(),
        slug,
        description: description || null,
        siteUrl: siteUrl || null,
        githubUrl: githubUrl || null,
        stack: stack || [],
        featured: Boolean(featured),
        enabled: Boolean(enabled),
        orderIndex: Number(orderIndex) || 0,
        locale: locale || 'all',
        photos: {
          create: (photos || []).map((ph: any, idx: number) => ({
            url: ph.url,
            publicId: ph.publicId || null,
            alternativeText: ph.alternativeText || title,
            orderIndex: idx,
          })),
        },
      },
      include: {
        photos: true,
      },
    });

    return new Response(JSON.stringify({ success: true, project }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al crear el proyecto.' }),
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
      slug: customSlug,
      description,
      siteUrl,
      githubUrl,
      stack = [],
      featured = false,
      enabled = true,
      orderIndex = 0,
      locale = 'all',
      photos = [],
    } = body;

    if (!id || !title) {
      return new Response(
        JSON.stringify({ error: 'ID y título del proyecto son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let slug = customSlug ? generateSlug(customSlug) : generateSlug(title);
    const existing = await prisma.project.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Delete existing photos and recreate with new order/list
    await prisma.projectPhoto.deleteMany({
      where: { projectId: id },
    });

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: String(title).trim(),
        slug,
        description: description || null,
        siteUrl: siteUrl || null,
        githubUrl: githubUrl || null,
        stack: stack || [],
        featured: Boolean(featured),
        enabled: Boolean(enabled),
        orderIndex: Number(orderIndex) || 0,
        locale: locale || 'all',
        photos: {
          create: (photos || []).map((ph: any, idx: number) => ({
            url: ph.url,
            publicId: ph.publicId || null,
            alternativeText: ph.alternativeText || title,
            orderIndex: idx,
          })),
        },
      },
      include: {
        photos: true,
      },
    });

    return new Response(JSON.stringify({ success: true, project: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al actualizar el proyecto.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de proyecto requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find and delete photos in Cloudinary
    const project = await prisma.project.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (project?.photos) {
      for (const ph of project.photos) {
        if (ph.publicId) {
          await deleteFromCloudinary(ph.publicId);
        }
      }
    }

    await prisma.project.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al eliminar el proyecto.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
