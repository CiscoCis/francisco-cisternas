import type { Metadata } from 'next';
import Link from 'next/link';
import { getForumSettings } from '@/lib/content/forumSettings.server';
import { Icon } from '@/components/Icons';
import blogStyles from '@/components/BlogArchive.module.css';
import own from './guidelines.module.css';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'How discussion and participation work in the Forum.',
};

export default function GuidelinesPage() {
  const settings = getForumSettings();

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
          <h1 className="display display--page">Community Guidelines</h1>
        </header>

        <div className={`panel ${own.card}`}>
          <p className={own.body}>{settings.guidelinesBody}</p>
        </div>
      </div>
    </div>
  );
}
