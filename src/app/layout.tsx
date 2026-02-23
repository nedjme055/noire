import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Noire Store',
  description: 'Premium clothing store with cash on delivery across Algeria.',
  openGraph: {
    type: 'website',
    siteName: 'Noire Store',
    title: 'Noire Store',
    description: 'Premium clothing store with cash on delivery across Algeria.',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noire Store',
    description: 'Premium clothing store with cash on delivery across Algeria.'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
