import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${origin}/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${origin}/?lang=es" />
    <xhtml:link rel="alternate" hreflang="en" href="${origin}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/all-projects</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${origin}/all-projects?lang=es" />
    <xhtml:link rel="alternate" hreflang="en" href="${origin}/all-projects?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/all-projects" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
