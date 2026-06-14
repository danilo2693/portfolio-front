import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const API_URL = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';
  const API_TOKEN = import.meta.env.STRAPI_TOKEN;

  if (!API_TOKEN) {
    return new Response(JSON.stringify({ error: "Missing Strapi API token" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const result = await response.json();
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      const errorText = await response.text();
      console.error("Strapi error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to forward message to Strapi" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Endpoint server error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
