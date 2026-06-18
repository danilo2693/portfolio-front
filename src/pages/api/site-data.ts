// src/pages/api/site-data.ts
import type { APIRoute } from "astro";
import { getAbout, getExperiences, getProjects } from "../../lib/api";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") ?? "en";
  // Preview mode is not handled here; you could forward a cookie if needed.
  const isDraft = false;

  const about = await getAbout(lang, isDraft);
  const experiences = await getExperiences(lang, isDraft);
  const projectsRes = await getProjects(lang, undefined, isDraft);

  const responseBody = {
    about,
    experiences,
    projects: projectsRes?.data || [],
    totalProjects: projectsRes?.meta?.pagination?.total || 0,
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
