import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { visiblePosts, postBySlug, formatPostDate } from '@/data/blog';
import { asset } from '@/lib/asset';
import { Icon } from '@/components/Icons';
import styles from './post.module.css';

type Params = { slug: string };

// A static export needs at least one page for this dynamic route; with no
// posts published, this unlisted placeholder satisfies the exporter and
// disappears once a real post exists.
const PLACEHOLDER_SLUG = 'no-posts-yet';

export function generateStaticParams(): Params[] {
  if (!visiblePosts.length) return [{ slug: PLACEHOLDER_SLUG }];
  return visiblePosts.map((p) => ({ slug: p.slug }));
}

// Required for a fully static export: only the slugs above exist, anything
// else 404s instead of falling back to a server render.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) {
    return { title: 'Blog', robots: { index: false, follow: false } };
  }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = postBySlug(slug);

  if (!post) {
    if (slug !== PLACEHOLDER_SLUG) notFound();
    return (
      <main id="main" className={styles.main}>
        <div className={styles.article}>
          <p className={styles.crumb}>
            <Link href="/blog">
              <Icon name="chevron" size={15} className={styles.back} />
              All posts
            </Link>
          </p>
          <h1 className={`display display--statement ${styles.title}`}>
            Nothing published yet
          </h1>
          <p className={styles.excerpt}>
            The first posts are still being written. The{' '}
            <Link href="/blog">blog</Link> will list them as they appear.
          </p>
        </div>
      </main>
    );
  }

  const others = visiblePosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main id="main" className={styles.main}>
      <article className={styles.article}>
        <div className={styles.head}>
          <p className={styles.crumb}>
            <Link href="/blog">
              <Icon name="chevron" size={15} className={styles.back} />
              All posts
            </Link>
          </p>

          <div className={styles.meta}>
            <span className="chip chip--accent">{post.category}</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.draft && <span className="pending">Draft</span>}
          </div>

          <h1 className={`display display--statement ${styles.title}`}>
            {post.title}
          </h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </div>

        {post.image && (
          <figure className={styles.hero}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(post.image)} alt={post.imageAlt ?? ''} />
          </figure>
        )}

        <div className={styles.body}>
          {post.body.map((block, i) => {
            switch (block.type) {
              case 'h':
                return (
                  <h2 key={i} className={styles.h2}>
                    {block.text}
                  </h2>
                );
              case 'quote':
                return (
                  <blockquote key={i} className={styles.quote}>
                    <p>{block.text}</p>
                  </blockquote>
                );
              case 'list':
                return (
                  <ul key={i} className={styles.list}>
                    {block.items.map((item) => (
                      <li key={item}>
                        <span aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              case 'image':
                return (
                  <figure key={i} className={styles.figure}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(block.src)} alt={block.alt} loading="lazy" />
                    {block.caption && <figcaption>{block.caption}</figcaption>}
                  </figure>
                );
              default:
                return <p key={i}>{block.text}</p>;
            }
          })}
        </div>

        <aside className={styles.reply}>
          <span className={styles.replyIcon} aria-hidden="true">
            <Icon name="send" size={22} />
          </span>
          <div>
            <h2 className={styles.replyTitle}>Thoughts on this?</h2>
            <p className={styles.replyText}>
              There is no comment thread here on purpose. If you would like to
              reply, the contact form reaches me directly.
            </p>
            <Link href="/#contact" className="btn">
              Send a reply
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        </aside>
      </article>

      {others.length > 0 && (
        <div className={styles.more}>
          <h2 className={styles.moreTitle}>More writing</h2>
          <ul>
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>
                  <span className={styles.moreCat}>{p.category}</span>
                  <span className={styles.moreName}>{p.title}</span>
                  <Icon name="arrow" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.moreLinkWrap}>
        <Link href="/blog" className="btn">
          Read more posts
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </main>
  );
}
