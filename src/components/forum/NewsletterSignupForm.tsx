'use client';

import { useState } from 'react';
import { postToForumEndpoint, FORUM_ENDPOINT } from '@/lib/forumEndpoint';
import { Icon } from '../Icons';
import styles from './ForumForm.module.css';

const INTERESTS = [
  "Professor's Notes",
  'Research & Publications',
  'Marketing Insights',
  'Community Highlights',
  'Events & Talks',
  'Opportunities',
];

export default function NewsletterSignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const toggle = (i: string) =>
    setInterests((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap || !email.trim() || !name.trim()) return;
    setState('sending');
    const ok = await postToForumEndpoint('newsletter-signup', {
      name,
      email,
      interests: Array.from(interests),
    });
    setState(ok ? 'ok' : 'error');
    if (ok) {
      setName('');
      setEmail('');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Subscribe</h3>
      <p className={styles.blurb}>
        A short note about once a month — notes from the professor, community
        highlights, and new opportunities. Unsubscribe any time.
      </p>

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
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <fieldset className={`${styles.field} ${styles.interestsFieldset}`}>
        <legend className={styles.interestsLegend}>Interests (optional)</legend>
        <div className={styles.interests}>
          {INTERESTS.map((i) => (
            <button
              type="button"
              key={i}
              className={`chip ${interests.has(i) ? 'chip--accent' : 'chip--quiet'}`}
              aria-pressed={interests.has(i)}
              onClick={() => toggle(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="nl-company">Company</label>
        <input
          id="nl-company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !FORUM_ENDPOINT}>
        {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
        <Icon name="send" size={16} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && "Thank you — you're subscribed. A welcome email is on its way."}
        {state === 'error' && 'Something went wrong. Please try again in a moment.'}
        {state !== 'ok' && state !== 'error' && !FORUM_ENDPOINT && (
          <>This isn&apos;t connected yet — nothing will be sent.</>
        )}
      </p>
    </form>
  );
}
