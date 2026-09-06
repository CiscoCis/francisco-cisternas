import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { conversationBySlug } from '@/lib/content/conversations';
import { getVisibleConversations } from '@/lib/content/conversations.server';
import { asset } from '@/lib/asset';
import { Icon } from '@/components/Icons';
import CommentsPanel from '@/components/forum/CommentsPanel';
// Reuses the blog post's exact stylesheet — same article typography, same
// head/body/quote/list/image treatment.
import styles from '../../../blog/[slug]/post.module.css';
import own from './conversation.module.css';

type Params = { slug: string };

const PLACEHOLDER_SLUG = 'no-conversations-yet';

export function generateStaticParams(): Params[] {
  const items = getVisibleConversations();
  if (!items.length) return [{ slug: PLACEHOLDER_SLUG }];
  return items.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = conversationBySlug(getVisibleConversations(), slug);
  if (!item) return { title: 'Conversations', robots: { index: false, follow: false } };
  return { title: item.title, description: item.excerpt };
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const items = getVisibleConversations();
  const item = conversationBySlug(items, slug);

  if (!item) {
    if (slug !== PLACEHOLDER_SLUG) notFound();
    return (
      <div className={styles.main}>
        <div className={styles.article}>
          <p className={styles.crumb}>
            <Link href="/forum/conversations">
              <Icon name="chevron" size={15} className={styles.back} />
              All conversations
            </Link>
          </p>
          <h1 className={`display display--statement ${styles.title}`}>
            Nothing posted yet
          </h1>
          <p className={styles.excerpt}>
            The first conversation is still being written. The{' '}
            <Link href="/forum/conversations">Conversations</Link> list will show it as
            soon as it appears.
          </p>
        </div>
      </div>
    );
  }

  const authorName = item.guestAuthorName || 'Francisco Cisternas';
  const others = items.filter((c) => c.slug !== item.slug).slice(0, 2);

  return (
    <div className={styles.main}>
      <article className={styles.article}>
        <div className={styles.head}>
          <p className={styles.crumb}>
            <Link href="/forum/conversations">
              <Icon name="chevron" size={15} className={styles.back} />
              All conversations
            </Link>
          </p>

          <div className={styles.meta}>
            {item.category && <span className="chip chip--accent">{item.category}</span>}
            {item.kind !== 'Discussion' && <span className="chip chip--accent">{item.kind}</span>}
            <time dateTime={item.date}>{item.date}</time>
            {item.draft && <span className="pending">Draft</span>}
          </div>

          <h1 className={`display display--statement ${styles.title}`}>{item.title}</h1>
          <p className={styles.excerpt}>{item.excerpt}</p>

          <p className={own.byline}>
            {item.guestAuthorUrl ? (
              <>
                By{' '}
                <a href={item.guestAuthorUrl} target="_blank" rel="noopener noreferrer">
                  {authorName}
                </a>
                , guest contributor
              </>
            ) : (
              <>By {authorName}</>
            )}
          </p>
        </div>

        <div className={styles.body}>
          {item.body.map((block, i) => {
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
                    {block.items.map((it) => (
                      <li key={it}>
                        <span aria-hidden="true" />
                        {it}
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

        <CommentsPanel slug={item.slug} locked={item.locked} />
      </article>

      {others.length > 0 && (
        <div className={styles.more}>
          <h2 className={styles.moreTitle}>More conversations</h2>
          <ul>
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/forum/conversations/${c.slug}`}>
                  <span className={styles.moreCat}>{c.category ?? c.kind}</span>
                  <span className={styles.moreName}>{c.title}</span>
                  <Icon name="arrow" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.moreLinkWrap}>
        <Link href="/forum/conversations" className="btn">
          All conversations
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </div>
  );
}
