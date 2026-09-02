'use client';

import { useState } from 'react';
import { Icon } from './Icons';
import styles from './StayConnectedForm.module.css';

/**
 * Posts to a Google Apps Script Web App (see scripts/guestbook-endpoint.gs
 * for setup) which appends a row to a Google Sheet, marked "Pending
 * review" — nothing submitted here ever appears on the site by itself.
 * The professor reads what came in and, for anything he's happy to make
 * public, adds it himself through TinaCMS. Set
 * NEXT_PUBLIC_GUESTBOOK_ENDPOINT to enable submitting at all; with no
 * endpoint configured, the form says so plainly rather than pretending to
 * work.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_GUESTBOOK_ENDPOINT ?? '';

type State = 'idle' | 'sending' | 'ok' | 'error';

const EMPTY = { name: '', programme: '', graduationYear: '', message: '' };

export default function StayConnectedForm() {
  const [state, setState] = useState<State>('idle');
  const [form, setForm] = useState(EMPTY);
  const [anonymous, setAnonymous] = useState(false);
  const [trap, setTrap] = useState('');

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap || !ENDPOINT) return;

    setState('sending');
    try {
      // text/plain avoids a CORS preflight, same reasoning as the contact
      // form — Apps Script Web Apps don't answer OPTIONS requests.
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: anonymous ? '' : form.name,
          programme: form.programme,
          graduationYear: form.graduationYear,
          message: form.message,
          page: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      const ok = res.ok;
      setState(ok ? 'ok' : 'error');
      if (ok) {
        setForm(EMPTY);
        setAnonymous(false);
      }
    } catch {
      setState('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Leave a message</h3>
      <p className={styles.blurb}>
        Studied with me, or just want to say hello? A short note is more than enough. Nothing you write here appears on the site automatically — I read every message myself, and only publish the ones you and I are both happy to share.
      </p>

      <div className={styles.field}>
        <label className="field-label" htmlFor="sc-name">
          Name <span className={styles.optional}>optional</span>
        </label>
        <input
          id="sc-name"
          name="name"
          className="field"
          placeholder="Your name"
          autoComplete="name"
          disabled={anonymous}
          value={form.name}
          onChange={set('name')}
        />
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        <span>Post this anonymously</span>
      </label>

      <div className={styles.twoUp}>
        <div className={styles.field}>
          <label className="field-label" htmlFor="sc-programme">
            Programme <span className={styles.optional}>optional</span>
          </label>
          <input
            id="sc-programme"
            name="programme"
            className="field"
            placeholder="e.g. MSc Marketing"
            value={form.programme}
            onChange={set('programme')}
          />
        </div>

        <div className={styles.field}>
          <label className="field-label" htmlFor="sc-year">
            Graduation year <span className={styles.optional}>optional</span>
          </label>
          <input
            id="sc-year"
            name="graduationYear"
            className="field"
            placeholder="e.g. 2019"
            inputMode="numeric"
            value={form.graduationYear}
            onChange={set('graduationYear')}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className="field-label" htmlFor="sc-message">
          Message{' '}
          <span className="field-req" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="sc-message"
          name="message"
          className={`field ${styles.textarea}`}
          placeholder="Your message…"
          rows={4}
          required
          value={form.message}
          onChange={set('message')}
        />
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="sc-company">Company</label>
        <input
          id="sc-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={state === 'sending' || !ENDPOINT}>
        {state === 'sending' ? 'Sending…' : 'Send message'}
        <Icon name="send" size={17} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' && 'Thank you — your message has been received.'}
        {state === 'error' && 'Something went wrong on the way. Please try again in a moment.'}
        {state !== 'ok' &&
          state !== 'error' &&
          (ENDPOINT ? (
            'Participation is entirely optional, and messages are reviewed before anything is made public.'
          ) : (
            <>This isn&apos;t connected yet — nothing will be sent.</>
          ))}
      </p>
    </form>
  );
}
