import Link from 'next/link';
import type { Conversation } from '@/lib/content/conversations';
import type { ForumPerson } from '@/lib/content/people';
import type { Opportunity } from '@/lib/content/opportunities';
import type { ForumEvent } from '@/lib/content/forumEvents';
import { sortConversations } from '@/lib/content/conversations';
import { upcomingForumEvents } from '@/lib/content/forumEvents';
import { Icon } from '../Icons';
import Reveal from '../Reveal';
import ConversationCard from './ConversationCard';
import PersonCard from './PersonCard';
import OpportunityCard from './OpportunityCard';
import EventCard from './EventCard';
import CountUp from './CountUp';
import NewsletterSignupForm from './NewsletterSignupForm';
import styles from './ForumHome.module.css';

interface Props {
  introTitle: string;
  introLede: string;
  conversations: Conversation[];
  people: ForumPerson[];
  opportunities: Opportunity[];
  events: ForumEvent[];
}

export default function ForumHome({
  introTitle,
  introLede,
  conversations,
  people,
  opportunities,
  events,
}: Props) {
  const sorted = sortConversations(conversations);
  const latest = sorted.find((c) => c.kind === 'Discussion') ?? sorted[0];
  const questionOfWeek = sorted.find((c) => c.kind === 'Question of the Week');
  const featuredConversations = sorted.filter((c) => c.featured && c.slug !== latest?.slug).slice(0, 3);
  const featuredPeople = people.filter((p) => p.featured).slice(0, 4);
  const newOpportunities = opportunities.slice(0, 3);
  const upcomingEvents = upcomingForumEvents(events).slice(0, 3);

  const metrics = [
    { label: 'Conversations', value: conversations.length },
    { label: 'People', value: people.length },
    { label: 'Opportunities', value: opportunities.length },
    { label: 'Events', value: events.length },
  ].filter((m) => m.value > 0);

  return (
    <div className={`section ${styles.section}`}>
      <div className="container">
        <Reveal variant="group" as="header" className={styles.head}>
          <p className="eyebrow">Forum</p>
          <h1 className="display display--hero">{introTitle}</h1>
          <p className={styles.lede}>{introLede}</p>

          {metrics.length > 0 && (
            <div className={styles.metrics}>
              {metrics.map((m) => (
                <div key={m.label} className={styles.metric}>
                  <span className={styles.metricValue}>
                    <CountUp value={m.value} />
                  </span>
                  <span className={styles.metricLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </Reveal>

        {latest && (
          <Reveal className={styles.block}>
            <p className={styles.blockLabel}>From the professor</p>
            <ConversationCard conversation={latest} />
          </Reveal>
        )}

        {questionOfWeek && (
          <Reveal className={styles.block}>
            <p className={styles.blockLabel}>Question of the week</p>
            <ConversationCard conversation={questionOfWeek} />
          </Reveal>
        )}

        {featuredConversations.length > 0 && (
          <Reveal className={styles.block}>
            <div className={styles.blockHead}>
              <p className={styles.blockLabel}>Trending conversations</p>
              <Link href="/forum/conversations" className={styles.seeAll}>
                See all <Icon name="arrow" size={14} />
              </Link>
            </div>
            <Reveal variant="group" className={styles.grid}>
              {featuredConversations.map((c) => (
                <ConversationCard key={c.slug} conversation={c} />
              ))}
            </Reveal>
          </Reveal>
        )}

        {featuredPeople.length > 0 && (
          <Reveal className={styles.block}>
            <div className={styles.blockHead}>
              <p className={styles.blockLabel}>Featured people</p>
              <Link href="/forum/people" className={styles.seeAll}>
                See all <Icon name="arrow" size={14} />
              </Link>
            </div>
            <Reveal variant="group" className={styles.grid}>
              {featuredPeople.map((p) => (
                <PersonCard key={p.slug} person={p} />
              ))}
            </Reveal>
          </Reveal>
        )}

        {newOpportunities.length > 0 && (
          <Reveal className={styles.block}>
            <div className={styles.blockHead}>
              <p className={styles.blockLabel}>New opportunities</p>
              <Link href="/forum/opportunities" className={styles.seeAll}>
                See all <Icon name="arrow" size={14} />
              </Link>
            </div>
            <Reveal variant="group" className={styles.grid}>
              {newOpportunities.map((o) => (
                <OpportunityCard key={o.slug} opportunity={o} />
              ))}
            </Reveal>
          </Reveal>
        )}

        {upcomingEvents.length > 0 && (
          <Reveal className={styles.block}>
            <div className={styles.blockHead}>
              <p className={styles.blockLabel}>Upcoming events</p>
              <Link href="/forum/events" className={styles.seeAll}>
                See all <Icon name="arrow" size={14} />
              </Link>
            </div>
            <Reveal variant="group" className={styles.grid}>
              {upcomingEvents.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </Reveal>
          </Reveal>
        )}

        <Reveal className={`panel ${styles.newsletterCard}`}>
          <NewsletterSignupForm />
        </Reveal>
      </div>
    </div>
  );
}
