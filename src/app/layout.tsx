import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://bitsbysoh4m.sohamdarekar.dev'),
  title: {
    default: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    template: '%s | bitsbysoh4m - Soham Darekar'
  },
  description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life. Join the journey of continuous growth and discovery.',
  keywords: [
    'Soham Darekar',
    'blog sohamdarekar',
    'bitsbysoh4m',
    'weekly blog',
    'tech blog',
    'programming blog',
    'personal blog',
    'coding journal',
    'software development',
    'web development',
    'technology insights',
    'learning journal',
    'soham blog',
    'developer blog'
  ],
  authors: [{ name: 'Soham Darekar', url: 'https://sohamdarekar.dev' }],
  creator: 'Soham Darekar',
  publisher: 'Soham Darekar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bitsbysoh4m.sohamdarekar.dev',
    siteName: 'bitsbysoh4m - Soham Darekar Blog',
    title: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'bitsbysoh4m - Soham Darekar Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life.',
    creator: '@sohamdarekar',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://bitsbysoh4m.sohamdarekar.dev',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'bitsbysoh4m - Soham Darekar Blog',
    description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life.',
    url: 'https://bitsbysoh4m.sohamdarekar.dev',
    author: {
      '@type': 'Person',
      name: 'Soham Darekar',
      url: 'https://sohamdarekar.dev',
      sameAs: [
        'https://github.com/sohamdarekar',
        'https://twitter.com/sohamdarekar',
        'https://linkedin.com/in/sohamdarekar'
      ]
    },
    publisher: {
      '@type': 'Person',
      name: 'Soham Darekar',
    },
    inLanguage: 'en-US',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/qubit_dark.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = (() => {
                  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                    return localStorage.getItem('theme');
                  }
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                  }
                  return 'light';
                })();

                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
                window.localStorage.setItem('theme', theme);
              })();
            `,
          }}
        />
        <script 
          defer 
          src="https://analytics.sohamdarekar.dev/script.js" 
          data-website-id="5bd20e19-7ac7-4a74-86ff-bc10a06a3768"
        />
      </head>
      <body className="min-h-screen bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-gray-100 transition-colors">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
          <Header />
          <main className="my-4 md:my-6 lg:my-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
