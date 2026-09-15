import type { APIRoute } from 'astro';
import { uploadToCloudinary } from '../../../lib/cloudinary';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folderName = (formData.get('folder') as string) || undefined;
    const isRaw = formData.get('raw') === 'true' || (file instanceof File && file.type === 'application/pdf');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No se envió ningún archivo válido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinary(buffer, {
      folderName,
      resourceType: isRaw ? 'raw' : 'auto',
    });

    return new Response(
      JSON.stringify({
        success: true,
        url: result.url,
        publicId: result.publicId,
        format: result.format,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error uploading file to Cloudinary:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Error al subir el archivo a Cloudinary.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
