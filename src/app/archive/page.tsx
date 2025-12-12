import { getSortedPostsData } from '@/lib/posts';
import ArchiveClient from './ArchiveClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Archive | bitsbysoh4m - Soham Darekar',
  description: 'Browse all blog posts by Soham Darekar on bitsbysoh4m. Explore archived articles on technology, programming, software development, and personal insights.',
  keywords: [
    'Soham Darekar',
    'blog sohamdarekar',
    'blog archive',
    'bitsbysoh4m archive',
    'all posts',
    'tech articles',
    'programming posts'
  ],
  alternates: {
    canonical: 'https://blog.sohamdarekar.dev/archive',
  },
  openGraph: {
    title: 'Blog Archive | bitsbysoh4m - Soham Darekar',
    description: 'Browse all blog posts by Soham Darekar on bitsbysoh4m. Explore archived articles on technology, programming, and personal insights.',
    url: 'https://blog.sohamdarekar.dev/archive',
    type: 'website',
  },
};

export default async function ArchivePage() {
  const posts = getSortedPostsData();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">Archive</h1>
      <ArchiveClient posts={posts} />
    </div>
  );
}
