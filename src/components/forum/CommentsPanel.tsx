'use client';

import { useEffect, useState } from 'react';
import {
  getPublicComments,
  getReactionCounts,
  supabaseConfigured,
  type PublicComment,
  type ReactionCounts,
} from '@/lib/supabaseForum';
import { postToForumEndpoint } from '@/lib/forumEndpoint';
import { Icon, IconName } from '../Icons';
import styles from './CommentsPanel.module.css';

const REACTIONS: { key: keyof Omit<ReactionCounts, 'conversation_slug'>; label: string; icon: IconName }[] = [
  { key: 'insightful', label: 'Insightful', icon: 'bulb' },
  { key: 'interesting', label: 'Interesting', icon: 'star' },
  { key: 'agree', label: 'Agree', icon: 'check' },
  { key: 'curious', label: 'Curious', icon: 'compass' },
];

const EMPTY_COUNTS: Omit<ReactionCounts, 'conversation_slug'> = {
  insightful: 0,
  interesting: 0,
  agree: 0,
  curious: 0,
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CommentsPanel({ slug, locked }: { slug: string; locked?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [reacted, setReacted] = useState<Set<string>>(new Set());

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, r] = await Promise.all([getPublicComments(slug), getReactionCounts(slug)]);
      if (cancelled) return;
      setComments(c);
      setCounts(r ?? EMPTY_COUNTS);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const react = async (key: string) => {
    if (reacted.has(key)) return;
    setReacted((s) => new Set(s).add(key));
    setCounts((c) => ({ ...c, [key]: (c[key as keyof typeof c] ?? 0) + 1 }));
    const ok = await postToForumEndpoint('reaction', { conversationSlug: slug, reaction: key });
    if (!ok) {
      // Roll back the optimistic update — the write didn't actually land,
      // so let the visitor try again rather than showing a count that
      // doesn't match reality.
      setReacted((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
      setCounts((c) => ({ ...c, [key]: Math.max(0, (c[key as keyof typeof c] ?? 1) - 1) }));
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap || !body.trim()) return;
    setState('sending');
    const ok = await postToForumEndpoint('comment', {
      conversationSlug: slug,
      name,
      email,
      body,
    });
    setState(ok ? 'ok' : 'error');
    if (ok) {
      setName('');
      setEmail('');
      setBody('');
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.reactions} role="group" aria-label="React to this conversation">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`${styles.reaction} ${reacted.has(r.key) ? styles.reactionOn : ''}`}
            onClick={() => react(r.key)}
            disabled={reacted.has(r.key)}
          >
            <Icon name={r.icon} size={16} />
            {r.label}
            <span className={styles.reactionCount}>{counts[r.key]}</span>
          </button>
        ))}
      </div>

      <h2 className={styles.title}>
        Comments {!loading && comments.length > 0 && `(${comments.length})`}
      </h2>

      {loading ? (
        <div className={styles.skeletons} aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className={styles.skeleton}>
              <span className={styles.shimmerLine} style={{ width: '30%' }} />
              <span className={styles.shimmerLine} style={{ width: '85%' }} />
              <span className={styles.shimmerLine} style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>No comments yet — be the first to weigh in.</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((c) => (
            <li key={c.id} className={styles.comment}>
              <p className={styles.commentBody}>{c.body}</p>
              <p className={styles.commentBy}>
                {c.author_name} <span>· {formatWhen(c.created_at)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      {locked ? (
        <p className={styles.locked}>This conversation is closed to new comments.</p>
      ) : (
        <form className={styles.form} onSubmit={submitComment}>
          <p className={styles.formTitle}>Leave a comment</p>
          <div className={styles.twoUp}>
            <input
              className="field"
              placeholder="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="field"
              type="email"
              placeholder="Your email (not shown publicly)"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <textarea
            className="field"
            placeholder="Your comment…"
            rows={3}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className={styles.trap} aria-hidden="true">
            <label htmlFor="cm-company">Company</label>
            <input
              id="cm-company"
              tabIndex={-1}
              autoComplete="off"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={state === 'sending' || !supabaseConfigured}>
            {state === 'sending' ? 'Posting…' : 'Post comment'}
            <Icon name="send" size={16} />
          </button>
          <p className={styles.note} role="status" aria-live="polite">
            {state === 'ok' && 'Thank you — your comment is awaiting a quick review before it appears.'}
            {state === 'error' && 'Something went wrong. Please try again in a moment.'}
            {state !== 'ok' && state !== 'error' && !supabaseConfigured && (
              <>This isn&apos;t connected yet — nothing will be posted.</>
            )}
          </p>
        </form>
      )}
    </div>
  );
}
