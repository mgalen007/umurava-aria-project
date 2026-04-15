import React from 'react';
import './globals.css';

export const metadata = {
  title: 'ARIA | Recruitment Intelligence Analyst',
  description: 'AI Recruitment Intelligence Analyst',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
