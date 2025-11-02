'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  const handleShare = (platform: string) => {
    const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setShowFeedback(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-transparent hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-none py-0 px-0 transition-all duration-200 h-8 w-20 sm:h-10 sm:w-auto text-sm sm:text-base"
        aria-label="Share this post"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        <span className="text-xs sm:text-base font-medium">Share</span>
      </button>

      <div 
        className={`absolute z-30 top-1/2 left-full ml-2 -translate-y-1/2 flex flex-col gap-1 sm:gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg rounded-full shadow-2xl px-1.5 py-1.5 sm:px-2 sm:py-2 border border-gray-100 dark:border-gray-800 transition-all duration-200 ${
          isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
        }`}
      >
        <button 
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-1 sm:gap-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-full py-1.5 px-3 sm:py-2 sm:px-4 text-sm sm:text-base font-medium"
          aria-label="Share on Twitter/X"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>
        <button 
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-1 sm:gap-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-full py-1.5 px-3 sm:py-2 sm:px-4 text-sm sm:text-base font-medium"
          aria-label="Share on LinkedIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.223 0h.002z"/>
          </svg>
        </button>
        <button 
          onClick={handleCopyLink}
          className="flex items-center gap-1 sm:gap-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200 rounded-full py-1.5 px-3 sm:py-2 sm:px-4 text-sm sm:text-base font-medium"
          aria-label="Copy link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>

      {showFeedback && (
        <div className="fixed left-1/2 bottom-24 sm:top-4 sm:bottom-auto -translate-x-1/2 bg-gray-800/90 dark:bg-gray-700/90 text-white px-3 py-1 rounded-full shadow-md transition-all duration-300 z-50 text-xs font-medium whitespace-nowrap">
          Link copied!
        </div>
      )}
    </div>
  );
}
