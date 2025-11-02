// Full code for src/lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  image?: string;
  draft?: boolean;
  customSlug?: string;
}

export interface PostData extends PostFrontmatter {
  id: string;
  slug: string;
  content: string;
}

export interface FullPostData extends PostData {
  contentHtml: string;
  readingTime: number;
}

const postsDirectory = path.join(process.cwd(), '_content/blog');
const aboutDirectory = path.join(process.cwd(), '_content/about');

function getSlugFromTitle(title: string): string {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export function getSortedPostsData(): PostData[] {
  const folderNames = fs.readdirSync(postsDirectory);
  const allPostsData = folderNames.map(folderName => {
    const id = folderName;
    let fullPath = path.join(postsDirectory, folderName, `${folderName}.md`);
    
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(postsDirectory, folderName, `${folderName.replace(/ /g, '_')}.md`);
        if (!fs.existsSync(fullPath)) {
            const files = fs.readdirSync(path.join(postsDirectory, folderName));
            const mdFile = files.find(f => f.endsWith('.md'));
            if (!mdFile) return null;
            fullPath = path.join(postsDirectory, folderName, mdFile);
        }
    }
    
    return processPost(fullPath, id);
  }).filter((post): post is PostData => post !== null);

  return allPostsData.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
}

function processPost(fullPath: string, id: string): PostData | null {
    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const frontmatter = data as PostFrontmatter;
        const slug = frontmatter.customSlug || getSlugFromTitle(frontmatter.title);

        return {
          id,
          slug,
          content,
          ...frontmatter,
        };
    } catch (e) {
        console.error(`Error processing post ${fullPath}: `, e);
        return null;
    }
}

export async function getPostData(slug: string): Promise<FullPostData | null> {
  const allPosts = getSortedPostsData();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) return null;

  const processedContent = await remark()
    .use(html)
    .process(post.content);
  const contentHtml = processedContent.toString();
  const stats = readingTime(post.content);

  return {
    ...post,
    contentHtml,
    readingTime: Math.ceil(stats.minutes),
  };
}

export async function getAboutPage() {
    const fullPath = path.join(aboutDirectory, 'about.md');
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();
    
    return {
        ...data,
        contentHtml
    };
}
