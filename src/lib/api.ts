import { prisma } from './prisma';

function getLocalizedValue(val: any, locale = 'en'): any {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    return val[locale] || val['en'] || val['es'] || Object.values(val)[0] || '';
  }
  return val;
}

export async function getAbout(locale = 'en', isDraft = false) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: 'default' },
    });

    if (!profile) return null;

    let links: any[] = [];
    if (profile.links) {
      links = Array.isArray(profile.links)
        ? profile.links
        : JSON.parse(profile.links as string);
    }

    const photos = profile.avatarUrl ? [{ url: profile.avatarUrl }] : [];
    const cv = profile.cvUrl ? { url: profile.cvUrl } : null;

    return {
      id: profile.id,
      documentId: profile.id,
      name: profile.name,
      summary: getLocalizedValue(profile.summary, locale),
      description: getLocalizedValue(profile.description, locale),
      email: profile.email,
      phone: profile.phone,
      photos,
      cv,
      links,
    };
  } catch (error) {
    console.error('Error fetching about data from Prisma:', error);
    return null;
  }
}

export async function getExperiences(locale = 'en', isDraft = false) {
  try {
    const rawList = await prisma.experience.findMany({
      where: {
        ...(isDraft ? {} : { enabled: true }),
        OR: [{ locale: 'all' }, { locale }],
      },
      orderBy: { orderIndex: 'asc' },
    });

    return rawList.map((exp) => ({
      id: exp.id,
      documentId: exp.id,
      title: exp.title,
      companyName: exp.companyName,
      periodTime: exp.periodTime,
      description: getLocalizedValue(exp.description, locale),
      orderIndex: exp.orderIndex,
      enabled: exp.enabled,
    }));
  } catch (error) {
    console.error('Error fetching experiences from Prisma:', error);
    return [];
  }
}

export async function getProjects(locale = 'en', limit?: number, isDraft = false) {
  try {
    const rawList = await prisma.project.findMany({
      where: {
        ...(isDraft ? {} : { enabled: true }),
        OR: [{ locale: 'all' }, { locale }],
      },
      include: {
        photos: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
      take: limit,
    });

    const total = await prisma.project.count({
      where: {
        ...(isDraft ? {} : { enabled: true }),
        OR: [{ locale: 'all' }, { locale }],
      },
    });

    const formatted = rawList.map((p) => {
      let stack: any[] = [];
      if (p.stack) {
        stack = Array.isArray(p.stack) ? p.stack : JSON.parse(p.stack as string);
      }

      return {
        id: p.id,
        documentId: p.id,
        title: p.title,
        slug: p.slug,
        description: getLocalizedValue(p.description, locale),
        siteUrl: p.siteUrl,
        githubUrl: p.githubUrl,
        stack,
        featured: p.featured,
        enabled: p.enabled,
        orderIndex: p.orderIndex,
        photos: p.photos.map((ph) => ({
          url: ph.url,
          alternativeText: ph.alternativeText,
        })),
      };
    });

    return {
      data: formatted,
      meta: {
        pagination: {
          total,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching projects from Prisma:', error);
    return { data: [], meta: { pagination: { total: 0 } } };
  }
}

/**
 * Compatibility helper for existing fetchGraphQL in index.astro
 */
export async function fetchGraphQL(
  query: string,
  variables: Record<string, any> = {},
  isDraft = false
) {
  const locale = variables?.locale || 'en';
  const [about, experiences, projectsRes] = await Promise.all([
    getAbout(locale, isDraft),
    getExperiences(locale, isDraft),
    getProjects(locale, undefined, isDraft),
  ]);

  return {
    data: {
      about,
      experiences,
      projects: projectsRes.data,
    },
  };
}

export async function fetchAPI(
  endpoint: string,
  queryParams: Record<string, string> = {},
  isDraft = false
) {
  const locale = queryParams?.locale || 'en';
  if (endpoint.includes('project')) {
    const limit = queryParams['pagination[limit]']
      ? parseInt(queryParams['pagination[limit]'], 10)
      : undefined;
    return getProjects(locale, limit, isDraft);
  }
  if (endpoint.includes('experience')) {
    return getExperiences(locale, isDraft);
  }
  if (endpoint.includes('about')) {
    return getAbout(locale, isDraft);
  }
  return null;
}
