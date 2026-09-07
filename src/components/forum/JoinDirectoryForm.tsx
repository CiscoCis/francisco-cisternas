'use client';

import { useState } from 'react';
import { postToForumEndpoint, FORUM_ENDPOINT } from '@/lib/forumEndpoint';
import { Icon } from '../Icons';
import styles from './ForumForm.module.css';

const EMPTY = {
  name: '',
  email: '',
  role: '',
  organisation: '',
  location: '',
  programme: '',
  graduationYear: '',
  linkedinUrl: '',
  intro: '',
  expertise: '',
};

export default function JoinDirectoryForm() {
  const [form, setForm] = useState(EMPTY);
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap || !form.name.trim() || !form.email.trim() || !form.intro.trim()) return;
    setState('sending');
    const ok = await postToForumEndpoint('person-submission', { ...form });
    setState(ok ? 'ok' : 'error');
    if (ok) setForm(EMPTY);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Join the directory</h3>
      <p className={styles.blurb}>
        Studied with Francisco, or part of this community another way? Ask to
        be listed here so other members can find and connect with you.
        Submissions are reviewed before anything is published — this isn&apos;t
        the same as subscribing to the newsletter.
      </p>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Your name"
            required
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            type="email"
            placeholder="Your email (not shown publicly)"
            required
            value={form.email}
            onChange={set('email')}
          />
        </div>
      </div>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Role (optional)"
            value={form.role}
            onChange={set('role')}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Organisation (optional)"
            value={form.organisation}
            onChange={set('organisation')}
          />
        </div>
      </div>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Location (optional)"
            value={form.location}
            onChange={set('location')}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="LinkedIn (optional)"
            value={form.linkedinUrl}
            onChange={set('linkedinUrl')}
          />
        </div>
      </div>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Programme (optional)"
            value={form.programme}
            onChange={set('programme')}
          />
        </div>
        <div className={styles.field}>
          <input
            className="field"
            placeholder="Graduation year (optional)"
            value={form.graduationYear}
            onChange={set('graduationYear')}
          />
        </div>
      </div>

      <div className={styles.field}>
        <textarea
          className={`field ${styles.textarea}`}
          placeholder="A short introduction, in your own words"
          rows={3}
          required
          value={form.intro}
          onChange={set('intro')}
        />
      </div>

      <div className={styles.field}>
        <textarea
          className={`field ${styles.textarea}`}
          placeholder="What could you help other members with? (optional)"
          rows={2}
          value={form.expertise}
          onChange={set('expertise')}
        />
      </div>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="join-company">Company</label>
        <input
          id="join-company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !FORUM_ENDPOINT}>
        {state === 'sending' ? 'Sending…' : 'Ask to be listed'}
        <Icon name="send" size={16} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && 'Thank you — your request has been sent for review.'}
        {state === 'error' && 'Something went wrong. Please try again in a moment.'}
        {state !== 'ok' && state !== 'error' && !FORUM_ENDPOINT && (
          <>This isn&apos;t connected yet — nothing will be sent.</>
        )}
      </p>
    </form>
  );
}
