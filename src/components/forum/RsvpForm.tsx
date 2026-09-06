'use client';

import { useEffect, useState } from 'react';
import { getRsvpCount, supabaseConfigured } from '@/lib/supabaseForum';
import { postToForumEndpoint, FORUM_ENDPOINT } from '@/lib/forumEndpoint';
import { Icon } from '../Icons';
import styles from './ForumForm.module.css';
import own from './RsvpForm.module.css';

export default function RsvpForm({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    if (supabaseConfigured) {
      getRsvpCount(slug).then((n) => {
        if (!cancelled) setCount(n);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;
    setState('sending');
    const ok = await postToForumEndpoint('rsvp', { eventSlug: slug, name, email });
    setState(ok ? 'ok' : 'error');
    if (ok) {
      setCount((c) => (c ?? 0) + 1);
      setName('');
      setEmail('');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={own.head}>
        <h3 className={styles.title}>RSVP</h3>
        {count !== null && (
          <span className={own.count}>
            <Icon name="users" size={15} />
            {count} going
          </span>
        )}
      </div>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            type="email"
            placeholder="Your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="rsvp-company">Company</label>
        <input
          id="rsvp-company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !FORUM_ENDPOINT}>
        {state === 'sending' ? 'Sending…' : "I'll be there"}
        <Icon name="send" size={16} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && "Thank you — you're on the list."}
        {state === 'error' && 'Something went wrong. Please try again in a moment.'}
        {state !== 'ok' && state !== 'error' && !FORUM_ENDPOINT && (
          <>This isn&apos;t connected yet — nothing will be sent.</>
        )}
      </p>
    </form>
  );
}
