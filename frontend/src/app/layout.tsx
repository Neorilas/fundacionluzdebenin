import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fundación Luz de Benín',
  description: 'ONG española de cooperación al desarrollo en Benín, África Occidental.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
