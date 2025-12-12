import { getAboutPage } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Soham Darekar | bitsbysoh4m',
  description: 'Learn more about Soham Darekar and bitsbysoh4m - a weekly personal blog featuring insights on technology, programming, and personal growth. Discover the journey behind the blog.',
  keywords: [
    'Soham Darekar',
    'about Soham Darekar',
    'Soham Darekar bio',
    'Soham Darekar profile',
    'Soham Darekar developer',
    'Soham Darekar engineer',
    'Soham Darekar tech blogger',
    'Soham Darekar background',
    'blog sohamdarekar',
    'bitsbysoh4m about',
    'tech blogger',
    'software developer blog'
  ],
  alternates: {
    canonical: 'https://blog.sohamdarekar.dev/about',
  },
  openGraph: {
    title: 'About Soham Darekar | bitsbysoh4m',
    description: 'Learn more about Soham Darekar and bitsbysoh4m - a weekly personal blog featuring insights on technology, programming, and personal growth.',
    url: 'https://blog.sohamdarekar.dev/about',
    type: 'website',
  },
};

export default async function AboutPage() {
  const aboutData = await getAboutPage();

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: aboutData.contentHtml }} />
    </article>
  );
}
