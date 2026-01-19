import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.sohamdarekar.dev'),
  title: {
    default: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    template: '%s | bitsbysoh4m - Soham Darekar'
  },
  description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life. Join the journey of continuous growth and discovery.',
  keywords: [
    'Soham Darekar',
    'Soham Darekar blog',
    'Soham Darekar developer',
    'Soham Darekar AI ML',
    'Soham Darekar machine learning',
    'Soham Darekar Python',
    'Soham Darekar programmer',
    'Soham Darekar tech blog',
    'Soham Darekar weekly blog',
    'Soham Darekar data science',
    'Soham Darekar coding',
    'Soham Darekar software engineer',
    'blog sohamdarekar',
    'bitsbysoh4m',
    'soham blog',
    'sohamdarekar.dev',
    'weekly blog',
    'tech blog',
    'programming blog',
    'personal blog',
    'coding journal',
    'software development',
    'web development',
    'technology insights',
    'learning journal',
    'developer blog',
    'AI ML blog',
    'artificial intelligence',
    'machine learning',
    'Python programming',
    'data science',
    'deep learning',
    'tech career transition',
    'productivity tips',
    'digital minimalism',
    'fitness and coding',
    'personal growth',
    'weekly reflections',
    'tech learnings',
    'FOSS',
    'open source',
    'Jupyter notebooks',
    'Google Colab',
    'habit building',
    'work-life balance',
    'developer lifestyle',
    'self improvement',
    'gratitude journal'
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
    url: 'https://blog.sohamdarekar.dev',
    siteName: 'bitsbysoh4m - Soham Darekar Blog',
    title: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life.',
    images: [
      {
        url: '/images/profile.jpg',
        width: 512,
        height: 512,
        alt: 'Soham Darekar - bitsbysoh4m',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    description: 'A weekly personal blog by Soham Darekar featuring gratitude, learning, insights, and reflections on technology, coding, and life.',
    creator: '@sohamdarekar',
    images: ['/images/profile.jpg'],
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
  alternates: {
    canonical: 'https://blog.sohamdarekar.dev',
  },
  icons: {
    icon: [
      // Using qubit_light.png (the dark logo) so it is visible on white backgrounds
      { url: '/qubit_dark.png', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '512x512', type: 'image/png' },
    ],
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
    url: 'https://blog.sohamdarekar.dev',
    image: 'https://blog.sohamdarekar.dev/images/profile.jpg',
    logo: {
      '@type': 'ImageObject',
      url: 'https://blog.sohamdarekar.dev/images/profile.jpg',
      width: 512,
      height: 512
    },
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
      image: 'https://blog.sohamdarekar.dev/images/profile.jpg'
    },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://blog.sohamdarekar.dev/archive?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Manual icon link removed here to prevent conflicts with metadata above */}
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