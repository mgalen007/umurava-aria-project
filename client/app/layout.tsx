import React from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'ARIA | Recruitment Intelligence Analyst',
  description: 'AI Recruitment Intelligence Analyst',
  icons: {
    icon: [
      {
        url: '/image/logo-black.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/image/logo-white.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.variable}>{children}</body>
    </html>
  );
}
