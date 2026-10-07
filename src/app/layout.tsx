import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';

// Self-hosted at build time: no request to Google from the visitor's browser.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], weight: '700', variable: '--font-oswald', display: 'swap' });

export const metadata: Metadata = {
  title: 'España Corrupta — marcador de casos de corrupción',
  description: 'Un marcador no oficial que rastrea acusaciones y condenas en casos de corrupción en España.',
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
