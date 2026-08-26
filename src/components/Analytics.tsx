import Script from 'next/script';

/*
 * Visit tracking — absent entirely until configured, same pattern as the
 * contact form and Tina credentials elsewhere in this project. Two
 * independent, unrelated services:
 *
 * - GoatCounter: what the private "Analytics" screen inside TinaCMS
 *   reads from (see tina/screens/AnalyticsScreen.tsx) — the view count,
 *   the map, the visit list. This script tag is the only reason
 *   GoatCounter has anything to show; without it, that dashboard would
 *   just be empty.
 * - Google Analytics 4: kept deliberately separate, with its own
 *   dashboard/login (analytics.google.com) for deeper analysis — not
 *   pulled into the TinaCMS screen, since GA4's own API needs a service
 *   account (a much heavier, backend-only credential) to query.
 *
 * Snippets copied from each service's own current documentation at
 * setup time, not typed from memory:
 *   https://www.goatcounter.com/code
 *   https://developers.google.com/tag-platform/gtagjs/install
 */

const GOATCOUNTER_CODE = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  return (
    <>
      {GOATCOUNTER_CODE && (
        <Script
          data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`}
          src="https://gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      )}

      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
