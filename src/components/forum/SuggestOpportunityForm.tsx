'use client';

import { useState } from 'react';
import { postToForumEndpoint, FORUM_ENDPOINT } from '@/lib/forumEndpoint';
import { Icon } from '../Icons';
import styles from './ForumForm.module.css';

export default function SuggestOpportunityForm() {
  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;
    setState('sending');
    const ok = await postToForumEndpoint('opportunity-submission', {
      title,
      organisation,
      description,
      url,
      submittedByName: name,
      submittedByEmail: email,
    });
    setState(ok ? 'ok' : 'error');
    if (ok) {
      setTitle('');
      setOrganisation('');
      setDescription('');
      setUrl('');
      setName('');
      setEmail('');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Suggest an opportunity</h3>
      <p className={styles.blurb}>
        Know of a job, internship, or collaboration worth sharing? Send it in
        — the professor reviews every suggestion before it's posted.
      </p>

      <div className={styles.field}>
        <input
          className="field"
          placeholder="Opportunity title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Organisation"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            type="url"
            placeholder="Link to apply / learn more"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <textarea
          className={`field ${styles.textarea}`}
          placeholder="Short description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
        <label htmlFor="opp-company">Company</label>
        <input
          id="opp-company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !FORUM_ENDPOINT}>
        {state === 'sending' ? 'Sending…' : 'Suggest opportunity'}
        <Icon name="send" size={16} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && 'Thank you — your suggestion has been sent for review.'}
        {state === 'error' && 'Something went wrong. Please try again in a moment.'}
        {state !== 'ok' && state !== 'error' && !FORUM_ENDPOINT && (
          <>This isn&apos;t connected yet — nothing will be sent.</>
        )}
      </p>
    </form>
  );
}
