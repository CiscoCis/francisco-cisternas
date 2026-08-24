'use client';

import { useId, useState } from 'react';
import { Publication, citationFor } from '@/lib/content/publications';
import { asset } from '@/lib/asset';
import { Icon } from './Icons';
import Modal from './Modal';
import styles from './PublicationItem.module.css';

// Every control here is conditional: a paper with no DOI shows no DOI
// button, one with no abstract shows no abstract control. The abstract
// opens in a glass dialog rather than expanding inline, since these run to
// a couple of hundred words and would push every card below down the grid.
export default function PublicationItem({ pub }: { pub: Publication }) {
  const [openAbstract, setOpenAbstract] = useState(false);
  const [openCitation, setOpenCitation] = useState(false);
  const [copied, setCopied] = useState(false);
  // If a figure hasn't arrived yet (or was renamed), the first load error
  // hides it entirely rather than showing a broken-image icon, falling back
  // to the text-only layout — same as a paper with no figure at all.
  const [figureOk, setFigureOk] = useState(true);
  const hasFigure = Boolean(pub.image) && figureOk;

  // Hiding a broken figure is right for a visitor but silent for whoever
  // maintains the site, so in development the failure is named in the
  // console (stripped from the production bundle) — run `npm run
  // check:figures` to catch the usual cause, a filename case mismatch that
  // works on Windows/macOS locally and breaks on the case-sensitive
  // deployed server.
  const onFigureError = () => {
    setFigureOk(false);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[publications] Figure not found: ${pub.image}\n` +
          `  Expected at: public${pub.image}\n` +
          `  Paper: ${pub.title}\n` +
          `  Run "npm run check:figures" to list every missing or misnamed file.`
      );
    }
  };
  const base = useId().replace(/:/g, '');

  const citation = citationFor(pub);
  const doiUrl = pub.doi
    ? pub.doi.startsWith('http')
      ? pub.doi
      : `https://doi.org/${pub.doi}`
    : undefined;
  // `pdf` is either a local file (asset()-prefixed, offered as a download)
  // or a full URL hosted elsewhere — asset() and `download` are both wrong
  // for a cross-origin page.
  const pdfIsExternal = Boolean(pub.pdf?.startsWith('http'));
  const pdfHref = pub.pdf
    ? pdfIsExternal
      ? pub.pdf
      : asset(pub.pdf)
    : undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      className={`card ${styles.card} ${pub.featured ? styles.featured : ''}`}
      style={{ ['--tint' as string]: 'var(--teal)' }}
    >
      <span className="card-tint" aria-hidden="true" />
      {hasFigure &&
        (pub.abstract ? (
          <button
            type="button"
            className={styles.media}
            onClick={() => setOpenAbstract(true)}
            aria-label={`Read the abstract for ${pub.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(pub.image!)}
              alt={pub.imageAlt ?? ''}
              loading="lazy"
              onError={onFigureError}
            />
            <span className={styles.mediaHint} aria-hidden="true">
              <Icon name="search" size={15} />
              Abstract
            </span>
          </button>
        ) : (
          <div className={styles.media}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(pub.image!)}
              alt={pub.imageAlt ?? ''}
              loading="lazy"
              onError={onFigureError}
            />
          </div>
        ))}

      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.year}>{pub.year ?? '—'}</span>
          {pub.status && <span className="chip chip--quiet">{pub.status}</span>}
        </div>

        <h3 className={styles.title}>
          {pub.url ? (
            <a href={pub.url} target="_blank" rel="noopener noreferrer">
              {pub.title}
            </a>
          ) : (
            pub.title
          )}
        </h3>

        {pub.authors && <p className={styles.authors}>{pub.authors}</p>}

        {(pub.venue || pub.detail) && (
          <p className={styles.venue}>
            {pub.venue && <em>{pub.venue}</em>}
            {pub.detail && (
              <span className={styles.detail}>
                {pub.venue ? ', ' : ''}
                {pub.detail}
              </span>
            )}
          </p>
        )}

        {pub.keywords && pub.keywords.length > 0 && (
          <ul className={styles.keywords}>
            {pub.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          {pub.url && (
            <a
              className={styles.action}
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="external" size={15} />
              Journal
            </a>
          )}

          {doiUrl && (
            <a
              className={styles.action}
              href={doiUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="database" size={15} />
              DOI
            </a>
          )}

          {pdfHref && (
            <a
              className={styles.action}
              href={pdfHref}
              {...(pdfIsExternal
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : { download: true })}
            >
              <Icon name="download" size={15} />
              PDF
            </a>
          )}

          {pub.abstract && (
            <button
              type="button"
              className={styles.action}
              aria-haspopup="dialog"
              onClick={() => setOpenAbstract(true)}
            >
              <Icon name="doc" size={15} />
              Abstract
            </button>
          )}

          <button
            type="button"
            className={styles.action}
            aria-expanded={openCitation}
            aria-controls={`${base}-cit`}
            onClick={() => setOpenCitation((v) => !v)}
          >
            <Icon name="quote" size={15} />
            Cite
          </button>
        </div>

        {openCitation && (
          <div id={`${base}-cit`} className={styles.expand}>
            <p className={styles.citationText}>{citation}</p>
            <button type="button" className={styles.copyBtn} onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} size={14} />
              {copied ? 'Copied' : 'Copy citation'}
            </button>
          </div>
        )}

        {pub.doi && <p className={styles.doi}>DOI: {pub.doi}</p>}
      </div>

      {pub.abstract && (
        <Modal
          open={openAbstract}
          onClose={() => setOpenAbstract(false)}
          title={pub.title}
          eyebrow={
            <>
              <span>{pub.venue}</span>
              {pub.year && <em>{pub.year}</em>}
            </>
          }
          footer={
            <>
              {pub.url && (
                <a
                  className="btn"
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the paper
                  <Icon name="external" size={16} />
                </a>
              )}
              {doiUrl && (
                <a
                  className="btn btn--ghost"
                  href={doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="database" size={16} />
                  DOI
                </a>
              )}
              {pdfHref && (
                <a
                  className="btn btn--ghost"
                  href={pdfHref}
                  {...(pdfIsExternal
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : { download: true })}
                >
                  <Icon name="download" size={16} />
                  PDF
                </a>
              )}
            </>
          }
        >
          {hasFigure && (
            <figure className={styles.dialogFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(pub.image!)}
                alt={pub.imageAlt ?? ''}
                onError={onFigureError}
              />
            </figure>
          )}

          {pub.authors && <p className={styles.dialogAuthors}>{pub.authors}</p>}

          <p>{pub.abstract}</p>

          {pub.keywords && pub.keywords.length > 0 && (
            <ul className={styles.dialogKeywords}>
              {pub.keywords.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </article>
  );
}
