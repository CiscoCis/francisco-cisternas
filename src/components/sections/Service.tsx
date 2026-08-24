'use client';

import { useState } from 'react';
import type { ServiceGroup } from '@/lib/content/service';
import { servicePullQuote } from '@/lib/content/service';
import SectionHeader from '../SectionHeader';
import TriangleField from '../TriangleField';
import { Icon } from '../Icons';
import styles from './Service.module.css';

export default function Service({ serviceGroups }: { serviceGroups: ServiceGroup[] }) {
  const [active, setActive] = useState(serviceGroups[0]?.id);
  const group = serviceGroups.find((g) => g.id === active) ?? serviceGroups[0];

  if (!group) return null;

  return (
    <section id="service" className="section" aria-labelledby="service-h">
      <TriangleField variant="quiet" className={`triangles ${styles.tri}`} />
      <div className="container">
        <SectionHeader
          id="service"
          title="Service"
          lede="Contributing to academic communities and institutions through leadership, review, and service."
        />

        <div className={styles.tabs} role="tablist" aria-label="Service categories">
          {serviceGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              id={`svc-tab-${g.id}`}
              aria-selected={active === g.id}
              aria-controls="svc-panel"
              tabIndex={active === g.id ? 0 : -1}
              className={`${styles.tab} ${active === g.id ? styles.tabActive : ''}`}
              onClick={() => setActive(g.id)}
            >
              <Icon name={g.icon} size={21} />
              <span>{g.label}</span>
            </button>
          ))}
        </div>

        <div
          id="svc-panel"
          role="tabpanel"
          aria-labelledby={`svc-tab-${group.id}`}
          className={`tabpanel ${styles.panel}`}
        >
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item.role}>
                <span className={styles.role}>{item.role}</span>
                {item.detail ? (
                  <span className={styles.detail}>{item.detail}</span>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>

          {group.subGroups?.map((sub) => (
            <div key={sub.label} className={styles.sub}>
              <div className={styles.subHead}>
                <span className="icon-disc icon-disc--sm">
                  <Icon name="cap" />
                </span>
                <h3>{sub.label}</h3>
              </div>
              <ul className={styles.list}>
                {sub.items.map((item) => (
                  <li key={item.role}>
                    <span className={styles.role}>{item.role}</span>
                    {item.detail ? (
                      <span className={styles.detail}>{item.detail}</span>
                    ) : (
                      <span />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rendered only if Francisco supplies a line of his own — see the
            note in src/data/service.ts. */}
        {servicePullQuote && (
          <blockquote className={styles.quote}>
            <p>
              <span className={styles.mark} aria-hidden="true">
                &ldquo;
              </span>
              {servicePullQuote}
              <span className={styles.mark} aria-hidden="true">
                &rdquo;
              </span>
            </p>
          </blockquote>
        )}
      </div>
    </section>
  );
}
