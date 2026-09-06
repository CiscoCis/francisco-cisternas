import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedAnswers } from '@/lib/content/askAnswers.server';
import AskForm from '@/components/forum/AskForm';
import AnswerAccordion from '@/components/forum/AnswerAccordion';
import { Icon } from '@/components/Icons';
import styles from './ask.module.css';
import blogStyles from '@/components/BlogArchive.module.css';

export const metadata: Metadata = {
  title: 'Ask the Professor',
  description: 'Submit a question, or read answers to questions from the community.',
};

export default function AskPage() {
  const answers = getPublishedAnswers();

  return (
    <div className={`section ${blogStyles.section}`}>
      <div className="container">
        <p className={blogStyles.crumb}>
          <Link href="/forum">
            <Icon name="chevron" size={15} className={blogStyles.back} />
            Forum home
          </Link>
        </p>

        <header className={blogStyles.head}>
          <p className="eyebrow">Forum</p>
          <h1 className="display display--page">Ask the Professor</h1>
          <p className={blogStyles.lede}>
            A running, public archive of answered questions — plus a form to
            send in your own.
          </p>
        </header>

        <div className={styles.layout}>
          <div className={`panel ${styles.formCard}`}>
            <AskForm />
          </div>
          <div className={styles.answers}>
            <AnswerAccordion answers={answers} />
          </div>
        </div>
      </div>
    </div>
  );
}
