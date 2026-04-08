import GhostContentAPI from '@tryghost/content-api';
import GhostAdminAPI from '@tryghost/admin-api';
import { unstable_noStore as noStore } from 'next/cache';

export class AlreadyRegisteredError extends Error {
  constructor(message: string = 'Member already registered') {
    super(message);
    this.name = 'AlreadyRegisteredError';
  }
}

interface GhostTag {
  name: string;
}

interface GhostPost {
  id: string;
  slug: string;
  title: string;
  html?: string;
  plaintext?: string;
  excerpt?: string;
  published_at?: string;
  reading_time?: number;
  tags?: GhostTag[];
}

interface GhostContentPostsResponse {
  posts?: GhostPost[];
}

interface GhostPage {
  html?: string;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readingTime: number;
}

export interface BlogPostDetail extends BlogPostSummary {
  html: string;
}

const ghostUrl = process.env.GHOST_URL;
const ghostContentKey = process.env.GHOST_CONTENT_API_KEY;
const ghostAdminKey = process.env.GHOST_ADMIN_API_KEY;

if (!ghostUrl || !ghostContentKey) {
  throw new Error('GHOST_URL and GHOST_CONTENT_API_KEY must be defined.');
}

const contentApi = new GhostContentAPI({
  url: ghostUrl,
  key: ghostContentKey,
  version: 'v5.0',
});

const adminApi = ghostAdminKey
  ? new GhostAdminAPI({
      url: ghostUrl,
      key: ghostAdminKey,
      version: 'v5.0',
    })
  : null;

function mapGhostPost(post: GhostPost): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.excerpt || '',
    date: post.published_at || new Date().toISOString(),
    tags: post.tags?.map((tag) => tag.name) || [],
    content: post.plaintext || '',
    readingTime: post.reading_time || 1,
  };
}

export async function getPosts(): Promise<BlogPostSummary[]> {
  noStore();

  const posts = (await contentApi.posts.browse({
    limit: 'all',
    order: 'published_at DESC',
    include: 'tags',
    formats: ['html', 'plaintext'],
  })) as unknown as GhostPost[];

  return posts.map(mapGhostPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  noStore();

  const requestedSlug = decodeURIComponent(slug).trim();
  console.info('[ghost] getPostBySlug requested slug:', requestedSlug);

  const contentBaseUrl = 'https://ghost.sohamdarekar.dev';
  const postsUrl = new URL('/ghost/api/content/posts/', contentBaseUrl);
  postsUrl.searchParams.set('key', ghostContentKey);
  postsUrl.searchParams.set('slug', requestedSlug);
  postsUrl.searchParams.set('include', 'authors,tags');
  postsUrl.searchParams.set('formats', 'html,plaintext');
  postsUrl.searchParams.set('limit', '1');

  const response = await fetch(postsUrl.toString(), {
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Ghost Content API request failed (${response.status} ${response.statusText})`);
  }

  const data = (await response.json()) as GhostContentPostsResponse;
  const post = data.posts?.[0] ?? null;

  console.info('[ghost] getPostBySlug API response:', {
    status: response.status,
    found: Boolean(post),
    returnedSlug: post?.slug ?? null,
    postCount: data.posts?.length ?? 0,
  });

  if (!post) {
    return null;
  }

  const mapped = mapGhostPost(post);
  return {
    ...mapped,
    html: post.html || '',
  };
}

export async function getPageBySlug(slug: string): Promise<string | null> {
  try {
    noStore();

    const page = (await contentApi.pages.read(
      { slug },
      { formats: ['html'] }
    )) as unknown as GhostPage;

    return page.html || null;
  } catch {
    return null;
  }
}

export async function subscribeMember(email: string): Promise<void> {
  if (!adminApi) {
    throw new Error('GHOST_ADMIN_API_KEY must be defined for member subscriptions.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await (adminApi.members as any).add({
      email: normalizedEmail,
      subscribed: true,
    });
    return;
  } catch (error: any) {
    const message = `${error?.message || ''} ${error?.context || ''}`.toLowerCase();
    if (message.includes('already exists') || message.includes('already registered')) {
      throw new AlreadyRegisteredError();
    }
    throw error;
  }
}
