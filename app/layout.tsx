/**
 * Root layout — the <html> shell of every page (formerly index.html).
 * WHY these values: they are the site-wide defaults that crawlers and link
 * previews see before a page sets its own (usePageMeta today, generateMetadata
 * per page from M2). No canonical / og:url here on purpose: a site-wide value
 * would declare every page to be the homepage (fixed in M0).
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL, ORGANIZATION_ID } from '@/constants/site';
import '@/index.css';

const TITLE = "Afrinia — Intelligence for Africa's Builders";
const DESCRIPTION =
  'Ideas, analysis and tools for entrepreneurs and innovators across Africa. Bilingual intelligence feed in English and French.';
const SHARE_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2Fabout1.png?alt=media&token=7ccaaeb4-f339-4e06-8cab-97d300d8c2aa';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: 'Afrinia' }],
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
    apple: '/favicon.svg',
  },
  openGraph: {
    siteName: 'Afrinia',
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    images: [SHARE_IMAGE],
    locale: 'fr_FR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AfriniaHQ',
    title: TITLE,
    description: 'Ideas, analysis and tools for entrepreneurs and innovators across Africa.',
    images: [SHARE_IMAGE],
  },
};

/** Site-level schema.org data — the Organization every article's publisher points to. */
const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Afrinia',
      url: SITE_URL,
      description: "Intelligence for Africa's builders — ideas, analysis and tools for entrepreneurs and innovators across the continent.",
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Afrinia',
      url: SITE_URL,
      publisher: { '@id': ORGANIZATION_ID },
      inLanguage: ['fr', 'en'],
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // TEMP: `lang` is the site default for every page until pages are
    // server-rendered per language (M2), exactly as index.html was.
    <html lang="fr">
      <head>
        {/* Fonts: one combined stylesheet request, as before (next/font in M6). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          // Static, trusted object defined above — no user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
