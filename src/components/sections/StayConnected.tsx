import type { GuestbookMessage } from '@/lib/content/guestbook';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import Reveal from '../Reveal';
import StayConnectedForm from '../StayConnectedForm';
import { Icon } from '../Icons';
import styles from './StayConnected.module.css';

/*
 * Stay Connected — a voluntary, opt-in way for students and former
 * students to leave a message, separate from the business-facing contact
 * form. Every submission is reviewed by the professor before anything
 * appears here (see scripts/guestbook-endpoint.gs); this component only
 * ever renders messages he has explicitly published through TinaCMS.
 */

export default function StayConnected({ messages }: { messages: GuestbookMessage[] }) {
  return (
    <section
      id="stay-connected"
      className="section section--tint"
      aria-labelledby="stay-connected-h"
    >
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />

      <div className="container">
        <SectionHeader
          id="stay-connected"
          eyebrow="Stay Connected"
          title="For students, past and present"
          lede="If you enjoyed a class, or just want to say hello, this is a low-key way to stay in touch — entirely optional, and you're welcome to post anonymously."
        />

        <Reveal variant="group" className={styles.layout}>
          <div className={`panel ${styles.formCard}`}>
            <StayConnectedForm />
          </div>

          {messages.length > 0 && (
            <div className={styles.wall}>
              <p className={styles.wallLabel}>
                <Icon name="heart" size={16} />
                Messages from students
              </p>
              <ul className={styles.messages}>
                {messages.map((m) => (
                  <li key={m.id} className={styles.message}>
                    <p className={styles.messageText}>“{m.message}”</p>
                    <p className={styles.messageBy}>
                      {m.displayName}
                      {(m.programme || m.graduationYear) && (
                        <span className={styles.messageMeta}>
                          {[m.programme, m.graduationYear].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
