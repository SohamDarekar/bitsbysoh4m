import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'bitsbysoh4m - Weekly Blog by Soham Darekar',
    short_name: 'bitsbysoh4m',
    description: 'A weekly personal blog by Soham Darekar featuring insights on technology, programming, and personal growth',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/profile.jpg',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/qubit_dark.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
