'use client';

import { useState, FormEvent } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NewsLetterForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Subscribing...');
    
    const emailValue = email.trim();
    
    try {
      console.log("Sending subscription request for:", emailValue);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: emailValue }),
      });
      
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      
      setStatus(res.ok ? "success" : "error");
      setMessage(data.message);
      if (res.ok) {
        setEmail('');
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setStatus('error');
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="my-12 p-8 md:p-10 rounded-3xl bg-surface-light dark:bg-[#171717] border border-[#3c3c3c] dark:border-[#acabab] shadow-xl transition-all">
      <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Stay in the Loop</h3>
      <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
        No spam, just real stories, tech tips, and inspiration delivered weekly straight to your e-mail.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-transparent" aria-label="Subscribe to newsletter" suppressHydrationWarning >
        <div className="flex flex-col sm:flex-row gap-3 w-full" suppressHydrationWarning>
          <label htmlFor="email" className="sr-only">Email address</label>
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-teal-400">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email" 
              required 
              autoComplete="email"
              aria-describedby="newsletter-feedback"
              disabled={status === 'loading'}
              className="w-full pl-12 pr-4 py-3.5 border border-[#1f1f1f] dark:border-[#acabab] rounded-xl bg-white dark:bg-[#171717] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              suppressHydrationWarning
            />
          </div>
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="px-10 py-3.5 rounded-xl bg-[#8b7bfe] hover:bg-[#7a6aed] text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-indigo-500/30"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        
        <div 
          id="newsletter-feedback" 
          className={`min-h-[2rem] flex items-center transition-all ${
            status === 'success' ? 'text-green-400' : 
            status === 'error' ? 'text-red-400' : ''
          }`}
        >
          {status === 'success' && (
            <span className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-sm">✓</span>
              {message}
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
