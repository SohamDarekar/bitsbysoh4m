import { getSortedPostsData } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';
import NewsLetterForm from '@/components/NewsLetterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'bitsbysoh4m - Weekly Blog by Soham Darekar | Tech Insights & Personal Reflections',
  description: 'Welcome to bitsbysoh4m, the personal blog of Soham Darekar. Explore weekly posts on technology, programming, software development, gratitude, and life reflections. Join the journey of continuous learning and growth.',
  keywords: [
    'Soham Darekar',
    'blog sohamdarekar',
    'bitsbysoh4m',
    'soham blog',
    'tech blog',
    'programming blog',
    'developer blog',
    'weekly tech insights',
    'coding journal',
    'software development blog',
    'personal tech blog',
    'soham darekar blog'
  ],
  alternates: {
    canonical: 'https://bitsbysoh4m.sohamdarekar.dev',
  },
};

export default async function HomePage() {
  const posts = getSortedPostsData();

  return (
    <>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Welcome to bitsbysoh4m</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A weekly journal of gratitude, learning, favourites, and personal reflections by Soham Darekar.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Latest Posts</h2>
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </section>

      <NewsLetterForm />
    </>
  );
}
