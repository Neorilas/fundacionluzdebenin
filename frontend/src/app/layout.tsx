import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org'),
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const lang = headersList.get('x-lang') || 'es';
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
