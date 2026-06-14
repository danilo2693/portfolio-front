const API_URL = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';
const API_TOKEN = import.meta.env.STRAPI_TOKEN;

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

export async function fetchAPI(endpoint: string, queryParams: Record<string, string> = {}, isDraft = false) {
  const url = new URL(`${API_URL}/api${endpoint}`);
  
  Object.keys(queryParams).forEach(key => {
    url.searchParams.append(key, queryParams[key]);
  });
  if (isDraft) {
    url.searchParams.append('status', 'draft');
    url.searchParams.append('t', Date.now().toString());
  }

  const fetchOptions: RequestInit = { headers };
  if (isDraft) {
    fetchOptions.cache = 'no-store';
  }

  const res = await fetch(url.toString(), fetchOptions);
  
  if (!res.ok) {
    console.error(`Error fetching ${url}: ${res.statusText}`);
    return null;
  }
  
  const json = await res.json();
  return json.data;
}

export async function getProjects(locale = 'en', limit?: number, isDraft = false) {
  const params: Record<string, string> = { populate: '*', locale, sort: 'sortOrder:asc' };
  if (isDraft) {
    params.status = 'draft';
    params.t = Date.now().toString();
  }
  if (limit) {
    params['pagination[limit]'] = limit.toString();
  }
  
  const url = new URL(`${API_URL}/api/projects`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const fetchOptions: RequestInit = { headers };
  if (isDraft) {
    fetchOptions.cache = 'no-store';
  }

  const res = await fetch(url.toString(), fetchOptions);
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
