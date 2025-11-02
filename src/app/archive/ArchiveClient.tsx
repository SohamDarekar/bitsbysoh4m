'use client';

import { useState, useMemo } from 'react';
import { PostData } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';

interface Props {
  posts: PostData[];
}

interface ScoredPost {
  post: PostData;
  score: number;
  context: string;
}

// Fuzzy matching function
function fuzzyMatch(text: string, query: string): { matches: boolean, score: number } {
  if (!query || !text) return { matches: false, score: 0 };
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match is highest score
  if (lowerText.includes(lowerQuery)) {
    return { 
      matches: true, 
      score: 1 + (lowerQuery.length / lowerText.length)
    };
  }
  
  // Check for fuzzy matches
  let score = 0;
  let matches = 0;
  let lastIndex = -1;
  
  const queryChars = lowerQuery.split('');
  
  for (const char of queryChars) {
    const index = lowerText.indexOf(char, lastIndex + 1);
    if (index !== -1) {
      matches++;
      lastIndex = index;
      if (index === lastIndex + 1) {
        score += 0.5;
      }
    }
  }
  
  const matchPercentage = matches / lowerQuery.length;
  
  if (matchPercentage >= 0.7) {
    return {
      matches: true,
      score: matchPercentage * 0.6
    };
  }
  
  return { matches: false, score: 0 };
}

// Find the best context for search results
function findBestContext(content: string, query: string, contextLength: number = 150): string {
  if (!query || !content) return '';
  
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let matchPosition = lowerContent.indexOf(lowerQuery);
  
  if (matchPosition === -1) {
    const words = lowerQuery.split(/\s+/);
    let bestScore = 0;
    let bestPos = 0;
    
    const chunkSize = 150;
    for (let i = 0; i < lowerContent.length - chunkSize; i += 50) {
      const chunk = lowerContent.substring(i, i + chunkSize);
      let chunkScore = 0;
      
      words.forEach(word => {
        if (word.length >= 3 && chunk.includes(word)) {
          chunkScore += word.length;
        }
      });
      
      if (chunkScore > bestScore) {
        bestScore = chunkScore;
        bestPos = i;
      }
    }
    
    if (bestScore > 0) {
      matchPosition = bestPos;
    } else {
      return '';
    }
  }
  
  let startPos = Math.max(0, matchPosition - contextLength);
  let endPos = Math.min(content.length, matchPosition + query.length + contextLength);
  
  if (startPos > 0) {
    const prevPeriod = content.lastIndexOf('. ', matchPosition);
    const prevNewline = content.lastIndexOf('\n', matchPosition);
    const prevSentence = Math.max(prevPeriod, prevNewline);
    
    if (prevSentence !== -1 && prevSentence > matchPosition - contextLength * 2) {
      startPos = prevSentence + 2;
    } else {
      const prevSpace = content.lastIndexOf(' ', matchPosition);
      if (prevSpace !== -1 && prevSpace > matchPosition - contextLength * 1.5) {
        startPos = prevSpace + 1;
      }
    }
  }
  
  if (endPos < content.length) {
    const nextPeriod = content.indexOf('. ', matchPosition);
    const nextNewline = content.indexOf('\n', matchPosition);
    let nextSentence = -1;
    
    if (nextPeriod !== -1 && nextNewline !== -1) {
      nextSentence = Math.min(nextPeriod, nextNewline);
    } else {
      nextSentence = Math.max(nextPeriod, nextNewline);
    }
    
    if (nextSentence !== -1 && nextSentence < matchPosition + contextLength * 2) {
      endPos = nextSentence + 1;
    }
  }
  
  let context = content.substring(startPos, endPos).trim();
  
  if (startPos > 0) context = '...' + context;
  if (endPos < content.length) context += '...';
  
  return context;
}

export default function ArchiveClient({ posts }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByRelevance, setSortByRelevance] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(inputValue);
      setSortByRelevance(true); // Auto-sort by relevance when searching
    }
  };

  const handleClearSearch = () => {
    setInputValue('');
    setSearchQuery('');
    setSortByRelevance(false);
  };

  const filteredAndScoredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const scoredPosts: ScoredPost[] = [];
    
    posts.forEach((post) => {
      // Simple exact substring matching (case-insensitive)
      const titleMatch = post.title?.toLowerCase().includes(query);
      const descriptionMatch = post.description?.toLowerCase().includes(query);
      const contentMatch = post.content?.toLowerCase().includes(query);
      const tagsMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(query));
      
      // Only include posts that actually contain the search term
      if (titleMatch || descriptionMatch || contentMatch || tagsMatch) {
        let totalScore = 0;
        if (titleMatch) totalScore += 3;
        if (descriptionMatch) totalScore += 1.5;
        if (contentMatch) totalScore += 1;
        if (tagsMatch) totalScore += 2;
        
        const context = findBestContext(post.content || '', query);
        scoredPosts.push({ post, score: totalScore, context });
      }
    });
    
    if (sortByRelevance) {
      return scoredPosts.sort((a, b) => b.score - a.score);
    }
    
    return scoredPosts;
  }, [posts, searchQuery, sortByRelevance]);

  return (
    <>
      <div className="mb-8">
        <label htmlFor="search" className="sr-only">Search posts</label>
        <input
          type="text"
          id="search"
          placeholder="Search posts by title, content, or tags..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 border border-[#acabab] rounded-lg bg-[#171717] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Search results for &ldquo;{searchQuery}&rdquo;
          </h2>
          
          {filteredAndScoredPosts.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-3">
              <span>
                Found {filteredAndScoredPosts.length} result{filteredAndScoredPosts.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSortByRelevance(!sortByRelevance)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                  sortByRelevance
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-300/40 dark:bg-gray-900/30 text-primary-700 dark:text-primary-300 hover:bg-gray-200 dark:hover:bg-gray-800/20'
                }`}
              >
                {sortByRelevance ? 'Sorted by relevance' : 'Sort by relevance'}
              </button>
            </div>
          )}
        </div>
      )}

      {!searchQuery ? (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Showing all {posts.length} posts
          </p>
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <BlogCard 
                post={post} 
                searchQuery=""
                searchContext=""
                matchScore={0}
              />
            </div>
          ))}
        </div>
      ) : searchQuery && filteredAndScoredPosts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No posts found matching your search criteria.
          </p>
          <button
            onClick={handleClearSearch}
            className="px-6 py-2.5 text-sm rounded-lg bg-white/50 dark:bg-black/5 text-primary-700 dark:text-primary-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-400/90 dark:border-gray-500/90 shadow-sm hover:shadow backdrop-blur-sm transition-all duration-200"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div>
          {filteredAndScoredPosts.map(({ post, score, context }) => (
            <div key={post.id} className="relative">
              <BlogCard 
                post={post} 
                searchQuery={searchQuery}
                searchContext={context}
                matchScore={0}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
