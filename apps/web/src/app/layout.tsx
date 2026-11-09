import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asteria: Mars outpost trainer',
  description: 'Keep a Mars outpost alive using real space weather and Earth–Mars light-time.',
};
export const viewport: Viewport = { themeColor: '#150c09' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
