import React from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
