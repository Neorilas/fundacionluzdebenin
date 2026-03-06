import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { api } from '@/lib/api';
import { Settings } from '@/lib/types';
import Analytics from '@/components/legal/Analytics';
import CookieBanner from '@/components/legal/CookieBanner';
import { Lang } from '@/lib/types';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

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
      <body>
        {children}
        <CookieBanner lang={lang} />
        <Analytics />
      </body>
    </html>
  );
}
