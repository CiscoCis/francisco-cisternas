import { ReactNode } from 'react';
import DigitalNetworkGraphic, { NetworkVariant } from './DigitalNetworkGraphic';
import Reveal from './Reveal';
import styles from './SectionHeader.module.css';

interface Props {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  network?: NetworkVariant;
  /** Optional element floated to the right of the title (e.g. inset photo). */
  aside?: ReactNode;
  accentRuleAbove?: boolean;
}

export default function SectionHeader({
  id,
  eyebrow,
  title,
  lede,
  network,
  aside,
  accentRuleAbove = false,
}: Props) {
  return (
    <header className={styles.wrap}>
      {network && (
        <DigitalNetworkGraphic variant={network} className={styles.network} />
      )}
      <div className={styles.inner}>
        {/* The eyebrow, heading and lede rise in sequence rather than
            all at once. */}
        <Reveal variant="group" className={styles.textCol}>
          {accentRuleAbove && <span className={styles.ruleAbove} aria-hidden="true" />}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-h`} className="display display--page">
            {title}
          </h2>
          {lede && <p className={styles.lede}>{lede}</p>}
        </Reveal>
        {aside && (
          <Reveal delay={120} className={styles.aside}>
            {aside}
          </Reveal>
        )}
      </div>
    </header>
  );
}
