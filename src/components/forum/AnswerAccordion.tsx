'use client';

import { useState } from 'react';
import type { AskAnswer } from '@/lib/content/askAnswers';
import { Icon } from '../Icons';
import styles from './AnswerAccordion.module.css';

function BlockBody({ answer }: { answer: AskAnswer }) {
  return (
    <div className={styles.answerBody}>
      {answer.answerBody.map((block, i) => {
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
  );
}

export default function AnswerAccordion({ answers }: { answers: AskAnswer[] }) {
  const [openId, setOpenId] = useState<string | null>(answers[0]?.id ?? null);

  if (answers.length === 0) {
    return <p className={styles.empty}>No questions have been answered publicly yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {answers.map((a) => {
        const open = openId === a.id;
        return (
          <li key={a.id} className={styles.item}>
            <button
              type="button"
              className={styles.question}
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : a.id)}
            >
              {a.question}
              <Icon
                name="chevron"
                size={16}
                className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
              />
            </button>
            <div className={styles.panel} hidden={!open}>
              <BlockBody answer={a} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
