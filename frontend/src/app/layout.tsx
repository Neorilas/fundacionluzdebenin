import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { api } from '@/lib/api';
import { Settings, Lang, SITE_URL } from '@/lib/types';
import Analytics from '@/components/legal/Analytics';
import CookieBanner from '@/components/legal/CookieBanner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const settings: Settings = await api.getSettings().catch(() => ({} as Settings));
  // Make icon URL absolute: uploads are served from backend (same domain in prod)
  const rawIcon = settings.faviconUrl || '/logo.jpg';
  const icon = rawIcon.startsWith('http') ? rawIcon : `${SITE_URL}${rawIcon}`;
  return {
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: [{ url: icon }],
      apple: [{ url: icon }],
      shortcut: [{ url: icon }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const lang = (headersList.get('x-lang') || 'es') as Lang;
  return (
    <html lang={lang}>
      <body className={inter.className}>
        {children}
        <CookieBanner lang={lang} />
        <Analytics />
      </body>
    </html>
  );
}
