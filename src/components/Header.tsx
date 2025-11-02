'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/', text: 'Home' },
  { href: '/archive', text: 'Archive' },
  { href: '/about', text: 'About' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="mb-6 md:mb-8 lg:mb-10">
      <nav className="flex items-center justify-between py-4 md:py-5 lg:py-6">
        <Link href="/" className="flex items-center">
          <img
            src="/qubit_dark.png"
            alt="bitsbysoh4m logo"
            className="h-6 md:h-7 lg:h-8 w-auto hidden dark:block"
          />
          <img
            src="/qubit_light.png"
            alt="bitsbysoh4m logo"
            className="h-6 md:h-7 lg:h-8 w-auto block dark:hidden"
          />
          <span className="ml-2 text-xl md:text-2xl lg:text-3xl font-bold text-black dark:bg-gradient-to-r dark:from-gray-200 dark:to-primary-100 dark:bg-clip-text dark:text-transparent">
            bitsbysoh4m
          </span>
        </Link>
        
        <div className="flex items-center gap-4 md:gap-5 lg:gap-6">
          <div className="hidden md:flex md:items-center md:gap-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm md:text-base lg:text-lg"
              >
                {item.text}
              </Link>
            ))}
          </div>
          
          <ThemeToggle />
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-900 dark:hover:text-primary-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
