import Link from 'next/link';
import { BlogCategory, BlogPost, formatPostDate } from '@/data/blog';
import { asset } from '@/lib/asset';
import { Icon } from './Icons';
import styles from './PostCard.module.css';

/*
 * One blog post as a card. Used on the home page strip and on the archive,
 * so both stay identical without duplicating markup. Styled to match the
 * Media & Stories cards — same card/tint/chip treatment, just tinted per
 * blog category instead of per media category.
 */

const TINT: Record<BlogCategory, string> = {
  Teaching: 'var(--teal)',
  Research: 'var(--blue)',
  Analytics: 'var(--cyan)',
  Technology: 'var(--red)',
  Travel: 'var(--teal-700)',
  Reflections: 'var(--blue-600)',
};

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <article
      className={`card card--link ${styles.card}`}
      style={{ ['--tint' as string]: TINT[post.category] ?? 'var(--blue)' }}
    >
      <span className="card-tint" aria-hidden="true" />
      {post.image && (
        <div className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(post.image)}
            alt={post.imageAlt ?? ''}
            loading="lazy"
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.top}>
          <span className="chip chip--accent">{post.category}</span>
          {post.draft && <span className="pending">Draft</span>}
        </div>

        <h3 className={styles.title}>
          <Link href={`/blog/${post.slug}`}>
            <span className={styles.hit} aria-hidden="true" />
            {post.title}
          </Link>
        </h3>

        <p className={styles.excerpt}>{post.excerpt}</p>

        <p className={styles.foot}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span className={styles.read}>
            Read
            <Icon name="arrow" size={15} />
          </span>
        </p>
      </div>
    </article>
  );
}
