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

  const baseUrl = 'https://bitsbysoh4m.sohamdarekar.dev';
  const postUrl = `${baseUrl}/blog/${params.slug}`;
  const ogImage = `${baseUrl}/images/og-image.png`;

  return {
    title: postData.title,
    description: postData.description || `Read ${postData.title} by Soham Darekar on bitsbysoh4m`,
    authors: [{ name: 'Soham Darekar', url: 'https://sohamdarekar.dev' }],
    creator: 'Soham Darekar',
    publisher: 'Soham Darekar',
    keywords: [
      'Soham Darekar',
      'blog sohamdarekar',
      'bitsbysoh4m',
      postData.title,
      'weekly blog',
      'tech blog',
      'programming insights',
      'developer journal'
    ],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: postUrl,
      title: postData.title,
      description: postData.description || `Read ${postData.title} by Soham Darekar on bitsbysoh4m`,
      siteName: 'bitsbysoh4m - Soham Darekar Blog',
      publishedTime: new Date(postData.date).toISOString(),
      authors: ['Soham Darekar'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: postData.description || `Read ${postData.title} by Soham Darekar on bitsbysoh4m`,
      creator: '@sohamdarekar',
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const postData = await getPostData(params.slug);

  if (!postData) {
    notFound();
  }

  const { title, date, readingTime, contentHtml, description } = postData;
  
  const baseUrl = 'https://bitsbysoh4m.sohamdarekar.dev';
  const postUrl = `${baseUrl}/blog/${params.slug}`;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description || title,
    datePublished: new Date(date).toISOString(),
    dateModified: new Date(date).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Soham Darekar',
      url: 'https://sohamdarekar.dev',
    },
    publisher: {
      '@type': 'Person',
      name: 'Soham Darekar',
    },
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    inLanguage: 'en-US',
    timeRequired: `PT${readingTime}M`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
