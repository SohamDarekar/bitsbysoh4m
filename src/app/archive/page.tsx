import { getSortedPostsData } from '@/lib/posts';
import ArchiveClient from './ArchiveClient';

export const metadata = {
  title: 'Archive',
  description: 'Browse all blog posts',
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
