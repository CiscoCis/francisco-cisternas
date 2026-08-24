'use client';

import { useState } from 'react';
import { profile } from '@/data/profile';
import { Icon } from './Icons';
import styles from './ContactForm.module.css';

/**
 * Messages post to a Google Apps Script Web App (see
 * scripts/google-sheets-endpoint.gs for setup) which appends a row to a
 * Google Sheet — the destination and sheet live in that script, not here.
 * Set NEXT_PUBLIC_CONTACT_ENDPOINT to enable it; with no endpoint set, the
 * form does not pretend to send — it composes the message into the
 * visitor's own mail client instead, and says so above the button.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? '';

const SUBJECTS = [
  'Research collaboration',
  'Speaking invitation',
  'Media enquiry',
  'Teaching or programme enquiry',
  'PhD / student enquiry',
  'Response to something I wrote',
  'Other',
];

type State = 'idle' | 'sending' | 'ok' | 'error';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function ContactForm() {
  const [state, setState] = useState<State>('idle');
  const [form, setForm] = useState(EMPTY);
  const [trap, setTrap] = useState('');

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) return;

    if (!ENDPOINT) {
      const subject = encodeURIComponent(
        form.subject ? `${form.subject} — website enquiry` : 'Website enquiry'
      );
      const body = encodeURIComponent(
        `${form.message}\n\n—\n${form.name}\n${form.email}`
      );
      window.location.href = `mailto:${profile.contact.email}?subject=${subject}&body=${body}`;
      return;
    }

    setState('sending');
    try {
      // text/plain avoids a CORS preflight: Apps Script Web Apps don't answer
      // OPTIONS, so an application/json POST is rejected by the browser
      // before it leaves. The script reads the raw body and parses it as JSON.
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...form,
          subject: form.subject || '(no subject)',
          page: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      const ok = res.ok;
      setState(ok ? 'ok' : 'error');
      if (ok) setForm(EMPTY);
    } catch {
      setState('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Send a message</h3>
      <p className={styles.blurb}>
        This reaches me directly. I read everything, and reply to what I can.
      </p>

      <div className={styles.field}>
        <label className="field-label" htmlFor="cf-name">
          Name{' '}
          <span className="field-req" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="cf-name"
          name="name"
          className="field"
          placeholder="Your full name"
          required
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
        />
      </div>

      <div className={styles.field}>
        <label className="field-label" htmlFor="cf-email">
          Email{' '}
          <span className="field-req" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          className="field"
          placeholder="Where I should reply"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
        />
      </div>

      <div className={styles.field}>
        <label className="field-label" htmlFor="cf-subject">
          Subject <span className={styles.optional}>optional</span>
        </label>
        <div className={styles.selectWrap}>
          <select
            id="cf-subject"
            name="subject"
            className="field"
            value={form.subject}
            onChange={set('subject')}
          >
            <option value="">What is this about?</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={15} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.field}>
        <label className="field-label" htmlFor="cf-message">
          Message{' '}
          <span className="field-req" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          className={`field ${styles.textarea}`}
          placeholder="Your message…"
          rows={5}
          required
          value={form.message}
          onChange={set('message')}
        />
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={state === 'sending'}
      >
        {state === 'sending'
          ? 'Sending…'
          : ENDPOINT
            ? 'Send message'
            : 'Compose message'}
        <Icon name="send" size={17} />
      </button>

      <p className={styles.note} role="status" aria-live="polite">
        {state === 'ok' &&
          'Thank you — your message has been received. I will reply as soon as I can.'}
        {state === 'error' &&
          'Something went wrong on the way. Please try again in a moment.'}
        {state !== 'ok' &&
          state !== 'error' &&
          (ENDPOINT ? (
            'I will do my best to respond within a few working days.'
          ) : (
            <>
              No form backend is connected yet, so this button opens your own
              email application with the message ready to send. Nothing is
              submitted to or stored by this website.
            </>
          ))}
      </p>
    </form>
  );
}
