'use client';

import { useState } from 'react';
import { postToForumEndpoint, FORUM_ENDPOINT } from '@/lib/forumEndpoint';
import { Icon } from '../Icons';
import styles from './ForumForm.module.css';

export default function IntroductionRequestForm({
  targetSlug,
  targetName,
}: {
  targetSlug: string;
  targetName: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;
    setState('sending');
    const ok = await postToForumEndpoint('introduction-request', {
      targetPersonSlug: targetSlug,
      requesterName: name,
      requesterEmail: email,
      reason,
    });
    setState(ok ? 'ok' : 'error');
    if (ok) {
      setName('');
      setEmail('');
      setReason('');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Request an introduction</h3>
      <p className={styles.blurb}>
        Would like to connect with {targetName}? Say a little about why, and the
        professor will decide whether to make the introduction.
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
            placeholder="Your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <textarea
          className={`field ${styles.textarea}`}
          placeholder="Why would you like to connect?"
          rows={3}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="intro-company">Company</label>
        <input
          id="intro-company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !FORUM_ENDPOINT}>
        {state === 'sending' ? 'Sending…' : 'Request introduction'}
        <Icon name="send" size={16} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && 'Thank you — your request has been sent to the professor.'}
        {state === 'error' && 'Something went wrong. Please try again in a moment.'}
        {state !== 'ok' && state !== 'error' && !FORUM_ENDPOINT && (
          <>This isn&apos;t connected yet — nothing will be sent.</>
        )}
      </p>
    </form>
  );
}
