import { getAboutPage } from '@/lib/posts';

export const metadata = {
  title: 'About',
  description: 'Learn more about bitsbysoh4m',
};

export default async function AboutPage() {
  const aboutData = await getAboutPage();

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: aboutData.contentHtml }} />
    </article>
  );
}
