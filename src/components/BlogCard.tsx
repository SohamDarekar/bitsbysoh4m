import Link from 'next/link';
import { PostData } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import readingTime from 'reading-time';
import React from 'react';

interface Props {
  post: PostData;
  searchQuery?: string;
  searchContext?: string;
  matchScore?: number;
}

// Function to highlight matching text
function highlightText(text: string, query: string): React.ReactElement {
  if (!query || !text) return <>{text}</>;
  
  // Split query into words for better highlighting
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= 3)
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  if (words.length === 0) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  }
  
  const regex = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        const isMatch = words.some(word => 
          part.toLowerCase() === word.toLowerCase().replace(/\\/g, '')
        );
        return isMatch ? (
          <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 px-0.5 rounded font-semibold">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}

export default function BlogCard({ post, searchQuery = '', searchContext = '', matchScore = 0 }: Props) {
  const { title, description, date, slug, content } = post;
  const stats = readingTime(content);
  const readingMins = Math.ceil(stats.minutes);

  const formatTime = (dateStr: string | Date): string => {
    const dateObj = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <article className="mb-8 rounded-lg p-5 transition-all duration-200 hover:shadow-md border border-gray-500/70 hover:border-gray-800/90 dark:border-gray-500/90 dark:hover:border-gray-400/90 bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10">
      <div>
        <Link href={`/blog/${slug}`} className="hover:underline">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors">
            {searchQuery ? highlightText(title, searchQuery) : title}
          </h2>
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <time dateTime={new Date(date).toISOString()}>
            {formatDate(date)} at {formatTime(date)}
          </time>
          <span className="mx-2">•</span>
          <span>{readingMins} min read</span>
        </div>
        
        {searchContext && searchQuery ? (
          <div className="my-3 bg-black/5 dark:bg-white/5 border-l-3 border-gray-400/50 dark:border-gray-500/50 rounded-r-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {highlightText(searchContext, searchQuery)}
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {searchQuery ? highlightText(description, searchQuery) : description}
          </p>
        )}
        
        <Link 
          href={`/blog/${slug}`}
          className="inline-flex items-center text-primary-700 dark:text-primary-400 hover:text-primary-800/95 dark:hover:text-primary-200/80 font-medium"
        >
          Read more
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
