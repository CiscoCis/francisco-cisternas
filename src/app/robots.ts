import type { MetadataRoute } from 'next';

// Required for `output: 'export'` — robots.txt has to be generated once at
// build time like every other route, not on demand.
export const dynamic = 'force-static';

const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
