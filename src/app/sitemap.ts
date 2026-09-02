import type { MetadataRoute } from 'next';
import { getVisiblePosts } from '@/lib/content/blog.server';

// Required for `output: 'export'` — sitemap.xml has to be generated once at
// build time like every other route, not on demand.
export const dynamic = 'force-static';

// Static export (`output: 'export'`) generates this once at build time into
// sitemap.xml — same absolute-URL logic as the Open Graph tags in
// layout.tsx, since a sitemap entry has to be a fully-qualified URL, not a
// root-relative path.
const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getVisiblePosts();

  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
