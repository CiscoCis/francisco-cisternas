'use client';

import { useState } from 'react';
import { postToForumEndpoint, FORUM_ENDPOINT } from '@/lib/forumEndpoint';
import { Icon } from '../Icons';
import styles from './ForumForm.module.css';

export default function AskForm() {
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap || !question.trim()) return;
    setState('sending');
    const ok = await postToForumEndpoint('ask-question', {
      question,
      askerName: name,
      askerEmail: email,
    });
    setState(ok ? 'ok' : 'error');
    if (ok) {
      setQuestion('');
      setName('');
      setEmail('');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Ask a question</h3>
      <p className={styles.blurb}>
        Curious about something in marketing, research, or academic life?
        Selected questions get answered here, publicly, as a lasting resource
        rather than a one-off reply.
      </p>

      <div className={styles.field}>
        <textarea
          className={`field ${styles.textarea}`}
          placeholder="Your question…"
          rows={3}
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            type="email"
            placeholder="Your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="ask-company">Company</label>
        <input
          id="ask-company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !FORUM_ENDPOINT}>
        {state === 'sending' ? 'Sending…' : 'Send question'}
        <Icon name="send" size={16} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && 'Thank you — your question has been sent.'}
        {state === 'error' && 'Something went wrong. Please try again in a moment.'}
        {state !== 'ok' && state !== 'error' && !FORUM_ENDPOINT && (
          <>This isn&apos;t connected yet — nothing will be sent.</>
        )}
      </p>
    </form>
  );
}
