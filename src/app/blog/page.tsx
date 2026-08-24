import type { Metadata } from 'next';
import { getVisiblePosts } from '@/lib/content/blog.server';
import BlogArchive from '@/components/BlogArchive';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Writing on teaching, research, analytics and technology by Francisco Cisternas.',
};

export default function BlogIndexPage() {
  return (
    <main id="main">
      <BlogArchive posts={getVisiblePosts()} />
    </main>
  );
}
