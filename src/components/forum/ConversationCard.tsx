import Link from 'next/link';
import type { Conversation, ConversationCategory } from '@/lib/content/conversations';
import { Icon } from '../Icons';
// Reuses the blog PostCard's exact stylesheet — same card/tint/chip
// treatment, so Conversations look like a native part of the site rather
// than a bolted-on forum design.
import styles from '../PostCard.module.css';

const TINT: Partial<Record<ConversationCategory, string>> = {
  Marketing: 'var(--blue)',
  'Consumer Behaviour': 'var(--cyan)',
  'AI & Technology': 'var(--red)',
  Research: 'var(--teal)',
  Careers: 'var(--brand-700)',
  Entrepreneurship: 'var(--blue-600)',
  'General Ideas': 'var(--teal-700)',
  'Professor Discussions': 'var(--brand-800)',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function ConversationCard({ conversation }: { conversation: Conversation }) {
  const authorLabel = conversation.guestAuthorName
    ? `Guest — ${conversation.guestAuthorName}`
    : null;

  return (
    <article
      className={`card card--link ${styles.card}`}
      style={{ ['--tint' as string]: TINT[conversation.category ?? 'General Ideas'] ?? 'var(--blue)' }}
    >
      <span className="card-tint" aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.top}>
          {conversation.pinned && (
            <span className="chip chip--quiet">
              <Icon name="pin" size={12} />
              Pinned
            </span>
          )}
          {conversation.kind !== 'Discussion' && (
            <span className="chip chip--accent">{conversation.kind}</span>
          )}
          {conversation.category && <span className="chip chip--accent">{conversation.category}</span>}
          {conversation.draft && <span className="pending">Draft</span>}
        </div>

        <h3 className={styles.title}>
          <Link href={`/forum/conversations/${conversation.slug}`}>
            <span className={styles.hit} aria-hidden="true" />
            {conversation.title}
          </Link>
        </h3>

        <p className={styles.excerpt}>{conversation.excerpt}</p>

        <p className={styles.foot}>
          <span>
            <time dateTime={conversation.date}>{formatDate(conversation.date)}</time>
            {authorLabel && <> · {authorLabel}</>}
          </span>
          <span className={styles.read}>
            Read
            <Icon name="arrow" size={15} />
          </span>
        </p>
      </div>
    </article>
  );
}
