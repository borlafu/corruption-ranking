import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import { DATA_AUTHOR, DATA_LICENSE, DATA_LICENSE_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import './globals.css';

// Self-hosted at build time: no request to Google from the visitor's browser.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], weight: '700', variable: '--font-oswald', display: 'swap' });

const title = SITE_TITLE;

const footLinkClass =
  'hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

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
  // Google Search Console ownership for the URL-prefix property. Public by design: it is served
  // in every page's <head>, which is how Google checks it.
  verification: { google: 'zBiEMf0TAunhqoico-KYB-JIVkuVxBX4YaOe9eG8H54' },
  // The image is `opengraph-image.tsx`, which Next also emits as twitter:image.
  twitter: { card: 'summary_large_image', title, description: SITE_DESCRIPTION },
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
        {/* Here and not in <Analytics />: that is a client component and must not import site.ts. */}
        <p className="pt-6 text-center text-xs text-muted-foreground">
          Datos de{' '}
          <a href={DATA_AUTHOR.url} className={footLinkClass}>
            {DATA_AUTHOR.name}
          </a>{' '}
          bajo licencia{' '}
          <a href={DATA_LICENSE} rel="license" className={footLinkClass}>
            {DATA_LICENSE_NAME}
          </a>
          : puedes reutilizarlos citando la fuente.
        </p>
        <Analytics />
      </body>
    </html>
  );
}
