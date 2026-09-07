/**
 * =========================================================================
 *  Forum — writes → Supabase
 * =========================================================================
 *
 *  A single Apps Script Web App that receives every write the Forum makes
 *  (comments, reactions, RSVPs, opportunity suggestions, introduction
 *  requests, Ask-the-Professor questions, newsletter signups) and inserts
 *  each into the matching Supabase table using the Supabase **service
 *  role** key — which lives only in this script's own Script Properties,
 *  never in any file the browser downloads. See scripts/supabase-forum-
 *  schema.sql for the tables themselves and the reasoning behind this
 *  split (Supabase's row-level security denies the public "anon" key
 *  write access to everything; this script is the only thing with
 *  permission to write).
 *
 *  This script does NOT live in a Google Sheet the way the other two do —
 *  there's no spreadsheet involved at all. Create it as a standalone Apps
 *  Script project instead.
 *
 *  ── SETUP (about five minutes, once) ─────────────────────────────────
 *
 *   1. Create the Supabase project first (see scripts/supabase-forum-
 *      schema.sql's own header) and run that whole SQL file in its SQL
 *      Editor — it now also grants service_role its expected default
 *      privileges, which some projects don't set up automatically (see
 *      that file's own comment on this). Then, from Settings → API Keys,
 *      copy:
 *        - the Project URL
 *        - the service_role key — click the "Legacy anon, service_role
 *          API keys" tab (NOT the newer "Publishable and secret API keys"
 *          tab's secret key). The newer sb_secret_... key format has a
 *          built-in guard that rejects requests it thinks look
 *          browser-like, which Apps Script's server-to-server calls
 *          trigger as a false positive ("Forbidden use of secret API key
 *          in browser") — the older JWT-style key (starts with `eyJ`)
 *          doesn't have this restriction and is the correct one here.
 *        - separately, the anon/publishable key is what the website's own
 *          code uses for public reads — that one's fine as the newer
 *          format, since browser use is exactly what it's for.
 *
 *   2. Go to script.google.com/home → New project. Delete the default
 *      code and paste this entire file in.
 *
 *   3. Project Settings (gear icon, left sidebar) → Script Properties →
 *      Add script property, twice:
 *        SUPABASE_URL          = <the Project URL from step 1>
 *        SUPABASE_SERVICE_KEY  = <the service_role key from step 1>
 *
 *   4. Save (Ctrl/Cmd+S). Give the project a name.
 *
 *   5. Deploy → New deployment → gear icon → Web app.
 *        Description      →  Forum endpoint
 *        Execute as       →  Me
 *        Who has access   →  Anyone
 *      Deploy, authorize when prompted (the usual "unsafe" click-through
 *      for a script you wrote yourself).
 *
 *   6. Copy the Web app URL. Add it to `.env.local` as
 *        NEXT_PUBLIC_FORUM_ENDPOINT=<that URL>
 *      and, for the live site, the same URL as a GitHub repository
 *      Variable named FORUM_ENDPOINT.
 *
 *   7. Also add the Supabase Project URL and anon key (from the same
 *      Settings → API page — the *public* one this time) as:
 *        NEXT_PUBLIC_SUPABASE_URL=<Project URL>
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
 *      locally, and as SUPABASE_URL / SUPABASE_ANON_KEY GitHub Variables
 *      for the live site. These are read directly by the browser for fast
 *      public lookups (comment counts, RSVP counts) — safe to expose,
 *      unlike the service_role key above.
 *
 *   8. Restart `npm run dev`, submit a real test through each Forum form,
 *      and confirm a row appears in the matching Supabase table.
 *
 *  ── STEP 9 (optional, ~5 minutes): make the newsletter welcome email ────
 *  ── genuinely come from the professor's own address ──────────────────────
 *
 *  Newsletter signups get an automatic welcome email. By default it's sent
 *  from whichever Google account runs this script, with the display name
 *  "Francisco Cisternas" — readable, but not his real address. This is the
 *  exact same platform rule and fix already used for the contact form (see
 *  scripts/google-sheets-endpoint.gs, step 7): Apps Script can only send
 *  FROM the account running the script, or an address that account has
 *  verified under Gmail's "Send mail as" feature.
 *
 *   9a. In the Gmail account that owns *this* script, Settings → See all
 *       settings → Accounts and Import → "Send mail as" → Add another
 *       email address → enter the professor's real address (same as
 *       NOTIFY_EMAIL below) → follow the verification email it sends.
 *   9b. Once verified, set WELCOME_FROM_ADDRESS below to that same address,
 *       save, and redeploy a new version (see "IF YOU EDIT THIS SCRIPT"
 *       below). Leave it as '' until then — an unverified address makes
 *       every welcome email fail instead of sending at all.
 *
 *  ── IF YOU EDIT THIS SCRIPT AFTER THE FIRST DEPLOYMENT ──────────────────
 *  Deploy → Manage deployments → pencil icon → Version: "New version" →
 *  Deploy — the same rule as the other two scripts. Editing the code
 *  alone changes nothing live.
 */

/* ---------- settings ------------------------------------------------------ */

var NOTIFY_EMAIL = 'fcisternas@cuhk.edu.hk';
var SEND_AS_NAME = 'Francisco Cisternas — Website';

/** The address the newsletter welcome email is sent FROM (see step 9
 *  above). Leave exactly '' until that one-time Gmail alias verification
 *  is done — MailApp throws "Invalid from address" otherwise. Once set,
 *  replies from a subscriber go to NOTIFY_EMAIL either way (see
 *  `replyTo` in handleNewsletterSignup), regardless of this setting. */
var WELCOME_FROM_ADDRESS = '';

function props() {
  return PropertiesService.getScriptProperties();
}

function supabaseUrl() {
  return props().getProperty('SUPABASE_URL');
}

function supabaseKey() {
  return props().getProperty('SUPABASE_SERVICE_KEY');
}

/* ---------- handler ------------------------------------------------------ */

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = String(data.action || '');

    switch (action) {
      case 'comment':
        return handleComment(data);
      case 'reaction':
        return handleReaction(data);
      case 'rsvp':
        return handleRsvp(data);
      case 'opportunity-submission':
        return handleOpportunitySubmission(data);
      case 'person-submission':
        return handlePersonSubmission(data);
      case 'introduction-request':
        return handleIntroductionRequest(data);
      case 'ask-question':
        return handleAskQuestion(data);
      case 'newsletter-signup':
        return handleNewsletterSignup(data);
      default:
        return json({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput(
    'This endpoint receives Forum submissions. Nothing to see here.'
  ).setMimeType(ContentService.MimeType.TEXT);
}

/* ---------- actions -------------------------------------------------------
   Each one: validate, insert into Supabase, optionally notify the
   professor. `insert()` throws on a non-2xx response, which the outer
   try/catch in doPost turns into a plain { ok: false } reply. */

function handleComment(data) {
  var slug = str(data.conversationSlug);
  var name = str(data.name) || 'Anonymous';
  var email = str(data.email);
  var body = str(data.body);
  if (!slug || !body || body.length > 4000) return json({ ok: false, error: 'invalid' });

  insert('forum_comments', {
    conversation_slug: slug,
    author_name: name,
    author_email: email,
    body: body,
  });

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      name: SEND_AS_NAME,
      subject: 'New Forum comment on "' + slug + '"',
      body: name + ' wrote:\n\n' + body + '\n\n—\nSaved as "pending" — publish it (or not) from the "Stay Connected"-style review flow whenever you like.',
    });
  }
  return json({ ok: true });
}

function handleReaction(data) {
  var slug = str(data.conversationSlug);
  var reaction = str(data.reaction);
  var allowed = ['insightful', 'interesting', 'agree', 'curious'];
  if (!slug || allowed.indexOf(reaction) === -1) return json({ ok: false, error: 'invalid' });

  // Upsert-by-increment: read the current row (if any), then write the
  // incremented value back. Good enough at Forum scale; a race between
  // two simultaneous reactions on the same conversation just means one
  // increment can be lost occasionally, which is an acceptable trade-off
  // for a reaction counter (not a financial ledger).
  var existing = selectOne('forum_reaction_counts', 'conversation_slug', slug);
  var counts = existing || {
    conversation_slug: slug,
    insightful: 0,
    interesting: 0,
    agree: 0,
    curious: 0,
  };
  counts[reaction] = (counts[reaction] || 0) + 1;
  upsert('forum_reaction_counts', 'conversation_slug', counts);

  return json({ ok: true });
}

function handleRsvp(data) {
  var slug = str(data.eventSlug);
  var name = str(data.name);
  var email = str(data.email);
  if (!slug || !name || !email) return json({ ok: false, error: 'invalid' });

  insert('forum_event_rsvps', { event_slug: slug, name: name, email: email });
  return json({ ok: true });
}

function handleOpportunitySubmission(data) {
  var title = str(data.title);
  if (!title) return json({ ok: false, error: 'invalid' });

  insert('forum_opportunity_submissions', {
    title: title,
    organisation: str(data.organisation),
    type: str(data.type),
    description: str(data.description),
    url: str(data.url),
    submitted_by_name: str(data.submittedByName),
    submitted_by_email: str(data.submittedByEmail),
  });

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      name: SEND_AS_NAME,
      subject: 'New opportunity suggestion: ' + title,
      body: 'From: ' + str(data.submittedByName) + ' <' + str(data.submittedByEmail) + '>\n\n' +
        title + '\n' + str(data.organisation) + '\n' + str(data.url) + '\n\n' + str(data.description) +
        '\n\n—\nReview and publish (or not) from the Supabase table editor / TinaCMS Forum — Opportunities.',
    });
  }
  return json({ ok: true });
}

function handlePersonSubmission(data) {
  var name = str(data.name);
  var email = str(data.email);
  if (!name || !email || email.indexOf('@') === -1) return json({ ok: false, error: 'invalid' });

  insert('forum_people_submissions', {
    name: name,
    email: email,
    role: str(data.role),
    organisation: str(data.organisation),
    location: str(data.location),
    programme: str(data.programme),
    graduation_year: str(data.graduationYear),
    linkedin_url: str(data.linkedinUrl),
    intro: str(data.intro),
    expertise: str(data.expertise),
  });

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      name: SEND_AS_NAME,
      subject: 'New "Join the directory" request: ' + name,
      body:
        name + ' <' + email + '> would like to be listed in the Forum People directory.\n\n' +
        (str(data.role) ? 'Role: ' + str(data.role) + '\n' : '') +
        (str(data.organisation) ? 'Organisation: ' + str(data.organisation) + '\n' : '') +
        (str(data.location) ? 'Location: ' + str(data.location) + '\n' : '') +
        (str(data.linkedinUrl) ? 'LinkedIn: ' + str(data.linkedinUrl) + '\n' : '') +
        '\n' + str(data.intro) +
        (str(data.expertise) ? '\n\nCan help with: ' + str(data.expertise) : '') +
        '\n\n—\nReview in the Supabase table editor (forum_people_submissions). If you\'d ' +
        'like to publish this, add a matching entry in TinaCMS under "Forum — People".',
    });
  }
  return json({ ok: true });
}

function handleIntroductionRequest(data) {
  var targetSlug = str(data.targetPersonSlug);
  var requesterName = str(data.requesterName);
  var requesterEmail = str(data.requesterEmail);
  if (!targetSlug || !requesterName || !requesterEmail) return json({ ok: false, error: 'invalid' });

  insert('forum_introduction_requests', {
    target_person_slug: targetSlug,
    requester_name: requesterName,
    requester_email: requesterEmail,
    reason: str(data.reason),
  });

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      name: SEND_AS_NAME,
      subject: 'New introduction request',
      body: requesterName + ' <' + requesterEmail + '> would like an introduction to "' + targetSlug + '":\n\n' + str(data.reason),
    });
  }
  return json({ ok: true });
}

function handleAskQuestion(data) {
  var question = str(data.question);
  if (!question) return json({ ok: false, error: 'invalid' });

  insert('forum_ask_questions', {
    question: question,
    asker_name: str(data.askerName),
    asker_email: str(data.askerEmail),
  });

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      name: SEND_AS_NAME,
      subject: 'New "Ask the Professor" question',
      body: question + '\n\n—\nFrom: ' + (str(data.askerName) || 'anonymous') +
        '\nAnswer it (or not) by adding a "Forum — Ask the Professor" entry in TinaCMS.',
    });
  }
  return json({ ok: true });
}

function handleNewsletterSignup(data) {
  var name = str(data.name);
  var email = str(data.email);
  if (!name || !email || email.indexOf('@') === -1) return json({ ok: false, error: 'invalid' });

  upsert('forum_newsletter_subscribers', 'email', {
    name: name,
    email: email,
    interests: Array.isArray(data.interests) ? data.interests : [],
  });

  var welcomeOptions = {
    to: email,
    name: 'Francisco Cisternas',
    replyTo: NOTIFY_EMAIL || undefined,
    subject: 'Welcome to the community, ' + name + '!',
    body:
      'Hi ' + name + ',\n\n' +
      'Thanks for subscribing to the Forum — it\'s genuinely nice to have you here.\n\n' +
      'A community like this only works because people like you show up, so consider ' +
      'this a small, sincere welcome from me.\n\n' +
      'About once a month, you\'ll get a short note in your inbox: a thought I\'ve been ' +
      'chewing on, something interesting from the community, a new opportunity, or an ' +
      'upcoming talk worth knowing about. That\'s it — no spam, no daily noise, and ' +
      'unsubscribing is always one click away.\n\n' +
      'If there\'s ever something you\'d like to see more of, just hit reply — I read ' +
      'everything that comes back.\n\n' +
      'Looking forward to having you around.\n\n' +
      'Best regards,\n' +
      'Francisco',
  };
  if (WELCOME_FROM_ADDRESS) welcomeOptions.from = WELCOME_FROM_ADDRESS;
  MailApp.sendEmail(welcomeOptions);

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      name: SEND_AS_NAME,
      subject: 'New newsletter subscriber: ' + name,
      body: name + ' <' + email + '> just subscribed to the Forum newsletter.',
    });
  }

  return json({ ok: true });
}

/* ---------- Supabase REST helpers ----------------------------------------
   Plain UrlFetchApp calls against PostgREST (what every Supabase project
   exposes at /rest/v1/<table>) — no client library needed for inserts
   this simple. */

function insert(table, row) {
  var res = UrlFetchApp.fetch(supabaseUrl() + '/rest/v1/' + table, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      apikey: supabaseKey(),
      Authorization: 'Bearer ' + supabaseKey(),
      Prefer: 'return=minimal',
    },
    payload: JSON.stringify(row),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) throw new Error('Supabase insert failed: ' + res.getContentText());
}

function upsert(table, conflictColumn, row) {
  var res = UrlFetchApp.fetch(
    supabaseUrl() + '/rest/v1/' + table + '?on_conflict=' + conflictColumn,
    {
      method: 'post',
      contentType: 'application/json',
      headers: {
        apikey: supabaseKey(),
        Authorization: 'Bearer ' + supabaseKey(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      payload: JSON.stringify(row),
      muteHttpExceptions: true,
    }
  );
  if (res.getResponseCode() >= 300) throw new Error('Supabase upsert failed: ' + res.getContentText());
}

function selectOne(table, column, value) {
  var res = UrlFetchApp.fetch(
    supabaseUrl() + '/rest/v1/' + table + '?' + column + '=eq.' + encodeURIComponent(value),
    {
      method: 'get',
      headers: {
        apikey: supabaseKey(),
        Authorization: 'Bearer ' + supabaseKey(),
      },
      muteHttpExceptions: true,
    }
  );
  if (res.getResponseCode() >= 300) return null;
  var rows = JSON.parse(res.getContentText());
  return rows[0] || null;
}

/* ---------- misc ----------------------------------------------------------- */

function str(v) {
  return v === null || v === undefined ? '' : String(v).trim();
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
