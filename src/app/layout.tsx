import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'bitsbysoh4m',
    template: '%s | bitsbysoh4m'
  },
  description: 'A weekly personal blog by Soham',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/qubit_dark.png" />
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
