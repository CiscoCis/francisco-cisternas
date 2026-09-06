import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedIssues } from '@/lib/content/newsletterIssues.server';
import NewsletterSignupForm from '@/components/forum/NewsletterSignupForm';
import { Icon } from '@/components/Icons';
import styles from '../ask/ask.module.css';
import blogStyles from '@/components/BlogArchive.module.css';
import own from './newsletter.module.css';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Subscribe for occasional notes, or browse the newsletter archive.',
};

export default function NewsletterPage() {
  const issues = getPublishedIssues();

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
          <h1 className="display display--page">Newsletter</h1>
          <p className={blogStyles.lede}>
            Occasional notes from the professor, sent by email — with every
            past issue archived here.
          </p>
        </header>

        <div className={styles.layout}>
          <div className={`panel ${styles.formCard}`}>
            <NewsletterSignupForm />
          </div>

          <div className={styles.answers}>
            {issues.length === 0 ? (
              <p className={own.empty}>No issues have gone out yet.</p>
            ) : (
              <ul className={own.list}>
                {issues.map((issue) => (
                  <li key={issue.slug} className={own.issue}>
                    <p className={own.issueDate}>{issue.date}</p>
                    <h3 className={own.issueTitle}>{issue.title}</h3>
                    <div className={own.issueBody}>
                      {issue.body.map((block, i) => {
                        switch (block.type) {
                          case 'h':
                            return <h4 key={i}>{block.text}</h4>;
                          case 'quote':
                            return <blockquote key={i}>{block.text}</blockquote>;
                          case 'list':
                            return (
                              <ul key={i}>
                                {block.items.map((it) => (
                                  <li key={it}>{it}</li>
                                ))}
                              </ul>
                            );
                          case 'image':
                            return null;
                          default:
                            return <p key={i}>{block.text}</p>;
                        }
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
