import type { APIRoute } from 'astro';

export const prerender = false;

interface SvglItem {
  id: number;
  title: string;
  category: string | string[];
  route: string | { light?: string; dark?: string };
  url?: string;
}

let cachedIcons: { id: number; title: string; iconUrl: string; category: string }[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

async function getAllIcons() {
  const now = Date.now();
  if (cachedIcons && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedIcons;
  }

  try {
    const res = await fetch('https://api.svgl.app');
    if (!res.ok) throw new Error('Failed to fetch from SVGL');
    const data = (await res.json()) as SvglItem[];

    cachedIcons = data.map((item) => {
      let iconUrl = '';
      if (typeof item.route === 'string') {
        iconUrl = item.route;
      } else if (item.route) {
        iconUrl = item.route.dark || item.route.light || '';
      }

      const category = Array.isArray(item.category)
        ? item.category.join(', ')
        : item.category || 'General';

      return {
        id: item.id,
        title: item.title,
        iconUrl,
        category,
      };
    }).filter((item) => Boolean(item.iconUrl));

    lastFetchTime = now;
    return cachedIcons;
  } catch (error) {
    console.error('Error fetching icons from SVGL:', error);
    return cachedIcons || [];
  }
}

export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim().toLowerCase();
  const limit = parseInt(url.searchParams.get('limit') || '60', 10);

  const icons = await getAllIcons();

  if (!query) {
    return new Response(JSON.stringify({ success: true, icons: icons.slice(0, limit) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const filtered = icons.filter((item) =>
    item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
  );

  return new Response(JSON.stringify({ success: true, icons: filtered.slice(0, limit) }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
