import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { profile } from '@/data/profile';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

/*
 * Fonts are self-hosted (woff2, latin subset only — 196 KB total) rather than
 * pulled from Google Fonts: no third-party request on load, no layout shift,
 * and the site builds and runs with no network access.
 */
const display = localFont({
  src: [
    { path: './fonts/playfair-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-display-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/playfair-display-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-display',
  fallback: ['Iowan Old Style', 'Palatino Linotype', 'Times New Roman', 'serif'],
});

const body = localFont({
  src: [
    { path: './fonts/lato-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/lato-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/lato-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/lato-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-body',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
});

/*
 * Absolute base for Open Graph / Twitter images. Social platforms will not
 * resolve a relative image path, so Next needs to know the final origin.
 * Set SITE_URL when deploying (the GitHub Actions workflow does it for you);
 * it falls back to localhost for `npm run dev`.
 */
const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  ''
);

/*
 * Absolute URL for a file in /public.
 *
 * NOT the same as asset(): siteUrl already includes the sub-path when the site
 * is served from one (https://user.github.io/repo), so prefixing with the base
 * path again would double it. Social crawlers need a fully-qualified URL, and
 * a root-relative path would resolve against the bare origin and lose the
 * sub-path — so build the whole thing here.
 */
const absoluteUrl = (path: string) => `${siteUrl}${path}`;

const tagline = 'Teaching · Research · Analytics';

const description =
  'Francisco Cisternas trained as an industrial engineer in Chile, took a PhD in marketing at Carnegie Mellon, and teaches and researches in Hong Kong. His work models the interactions between digital and physical channels using big data, with applications in financial, sports and retail industries.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${tagline}`,
    template: `%s — ${profile.name}`,
  },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: profile.contact.profileUrl }],
  keywords: [
    'Francisco Cisternas',
    'CUHK Business School',
    'Marketing',
    'Quantitative Marketing',
    'Mobile Marketing',
    'Channels Management',
    'Demand Optimization',
    'Sustainability',
    'Health Marketing',
  ],
  openGraph: {
    type: 'profile',
    title: `${profile.name} — ${tagline}`,
    description,
    siteName: profile.name,
    locale: 'en_HK',
    images: [
      {
        url: absoluteUrl('/images/og-card.jpg'),
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${profile.name} — ${tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} — ${tagline}`,
    description,
    images: [absoluteUrl('/images/og-card.jpg')],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#fdfbf7',
  width: 'device-width',
  initialScale: 1,
};

/** schema.org Person — structured academic metadata. */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  givenName: 'Francisco',
  familyName: 'Cisternas',
  jobTitle: profile.title,
  description,
  /* No email or telephone in the structured data: the contact form is the
     route in, and a scraped address outlives the role it belongs to. */
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'ORCID',
    value: profile.contact.orcidUrl,
  },
  worksFor: {
    '@type': 'CollegeOrUniversity',
    name: profile.university,
    department: {
      '@type': 'Organization',
      name: `${profile.department}, ${profile.school}`,
    },
  },
  alumniOf: profile.education.map((e) => ({
    '@type': 'CollegeOrUniversity',
    name: e.institution,
  })),
  knowsAbout: [...profile.researchTopics, ...profile.methods],
  sameAs: [profile.contact.orcidUrl, profile.contact.profileUrl],
  image: absoluteUrl('/images/og-card.jpg'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
