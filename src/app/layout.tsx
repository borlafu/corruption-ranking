import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

// Self-hosted at build time: no request to Google from the visitor's browser.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], weight: '700', variable: '--font-oswald', display: 'swap' });

const title = 'España Corrupta — marcador de casos de corrupción';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description: SITE_DESCRIPTION,
  alternates: {
    // Filters live in the query string, so every `?cat=…&anio=…` combination serves this same
    // page. One canonical collapses that whole crawl space onto the root.
    canonical: '/',
    // The feed covers the whole site's updates, so the root advertises it too. /cambios replaces
    // this whole `alternates` object with its own.
    types: { 'application/rss+xml': '/cambios/feed.xml' },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
  },
  // `summary` and not `summary_large_image`: there is no og:image to fill a large card.
  twitter: { card: 'summary', title, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: '#212121',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
