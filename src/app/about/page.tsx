import { getAboutPage } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Soham Darekar | bitsbysoh4m',
  description: 'Learn more about Soham Darekar and bitsbysoh4m - a weekly personal blog featuring insights on technology, programming, and personal growth. Discover the journey behind the blog.',
  keywords: [
    'Soham Darekar',
    'blog sohamdarekar',
    'about Soham Darekar',
    'bitsbysoh4m about',
    'tech blogger',
    'software developer blog'
  ],
  alternates: {
    canonical: 'https://bitsbysoh4m.sohamdarekar.dev/about',
  },
  openGraph: {
    title: 'About Soham Darekar | bitsbysoh4m',
    description: 'Learn more about Soham Darekar and bitsbysoh4m - a weekly personal blog featuring insights on technology, programming, and personal growth.',
    url: 'https://bitsbysoh4m.sohamdarekar.dev/about',
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
