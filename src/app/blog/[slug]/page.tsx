import { notFound } from 'next/navigation';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import { formatDate, formatTime } from '@/lib/utils';
import ShareButton from '@/components/ShareButton';
import NewsLetterForm from '@/components/NewsLetterForm';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const postData = await getPostData(params.slug);
  
  if (!postData) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: postData.title,
    description: postData.description,
  };
}

export default async function BlogPost({ params }: Props) {
  const postData = await getPostData(params.slug);

  if (!postData) {
    notFound();
  }

  const { title, date, readingTime, contentHtml } = postData;

  return (
    <>
      <article className="prose prose-sm sm:prose lg:prose-lg prose-slate dark:prose-invert mx-auto prose-headings:dark:text-gray-100 prose-hr:border-gray-600">
        <header className="mb-4 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-4xl text-gray-900 dark:text-gray-100">{title}</h1>
          <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm flex flex-wrap items-center gap-2">
            <time dateTime={new Date(date).toISOString()}>{formatDate(date)} at {formatTime(date)}</time>
            <span className="mx-2">•</span>
            <span>{readingTime} min read</span>
            <span className="mx-2">•</span>
            <ShareButton title={title} url={`/blog/${params.slug}`} />
          </div>
        </header>

        <div 
          className="mt-2 sm:mt-8 text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: contentHtml }} 
        />
      </article>

      <NewsLetterForm />
    </>
  );
}
