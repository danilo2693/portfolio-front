const API_URL = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';
const API_TOKEN = import.meta.env.STRAPI_TOKEN;

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
};

/**
 * Fetch with exponential back‑off retries for HTTP 429 responses.
 * Attempts up to 3 times (adjustable) before giving up.
 */
async function fetchWithRetry(url: string, attempt = 1, maxAttempts = 3): Promise<Response> {
  const res = await fetch(url, { headers });

  if (res.status === 429 && attempt < maxAttempts) {
    const delay = 200 * Math.pow(2, attempt - 1); // 200ms, 400ms, 800ms
    console.warn(`Rate limited ${url} – retry ${attempt}/${maxAttempts} in ${delay}ms`);
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, attempt + 1, maxAttempts);
  }
  return res;
}

export async function fetchAPI(
  endpoint: string,
  queryParams: Record<string, string> = {},
  isDraft = false
) {
  const url = new URL(`${API_URL}/api${endpoint}`);

  Object.keys(queryParams).forEach((key) => {
    url.searchParams.append(key, queryParams[key]);
  });

  if (isDraft) {
    url.searchParams.append('status', 'draft');
  }

  const res = await fetchWithRetry(url.toString());

  if (!res.ok) {
    console.error(`Error fetching ${url}: ${res.statusText}`);
    return null;
  }

  const json = await res.json();
  return json;
}

/**
 * Fetch data from Strapi GraphQL endpoint with optional variables.
 * Uses exponential back‑off for HTTP 429 responses (up to 3 attempts).
 */
export async function fetchGraphQL(
  query: string,
  variables: Record<string, any> = {},
  isDraft = false
) {
  const url = `${API_URL}/graphql`;
  // Include draft flag if needed
  const searchParams = new URLSearchParams();
  if (isDraft) searchParams.append('status', 'DRAFT');
  const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url;

  let attempt = 1;
  const maxAttempts = 3;
  while (true) {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    if (res.status === 429 && attempt < maxAttempts) {
      const delay = 200 * Math.pow(2, attempt - 1);
      console.warn(`GraphQL Rate limited – retry ${attempt}/${maxAttempts} in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
      continue;
    }
    if (!res.ok) {
      console.error(`GraphQL fetch error ${res.status}: ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    return json;
  }
}


export async function getProjects(locale = 'en', limit?: number, isDraft = false) {
  const params: Record<string, string> = { populate: '*', locale, sort: 'sortOrder:asc' };

  if (isDraft) params.status = 'draft';
  if (limit) params['pagination[limit]'] = limit.toString();

  const url = new URL(`${API_URL}/api/projects`);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  const res = await fetchWithRetry(url.toString());

  if (!res.ok) {
    console.error(`Error fetching projects: ${res.statusText}`);
    return { data: [], meta: { pagination: { total: 0 } } };
  }

  return await res.json();
}

export async function getExperiences(locale = 'en', isDraft = false) {
  return await fetchAPI('/experiences', { populate: '*', locale, sort: 'sortOrder:asc' }, isDraft);
}

export async function getAbout(locale = 'en', isDraft = false) {
  return await fetchAPI('/about', { populate: '*', locale }, isDraft);
}
