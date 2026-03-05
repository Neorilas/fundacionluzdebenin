import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { api } from '@/lib/api';
import { Settings } from '@/lib/types';
import './globals.css';

const GA_ID = 'G-1SRJRDK6DD';

export async function generateMetadata(): Promise<Metadata> {
  const settings: Settings = await api.getSettings().catch(() => ({} as Settings));
  const icon = settings.faviconUrl || '/logo.jpg';
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org'),
    icons: { icon, apple: icon },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const lang = headersList.get('x-lang') || 'es';
  return (
    <html lang={lang}>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
      <body>{children}</body>
    </html>
  );
}
