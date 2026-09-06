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
 *      Editor. Then, from Settings → API, copy:
 *        - the Project URL
 *        - the service_role key (NOT the anon key — this script needs the
 *          privileged one; the anon key is what the website's own code
 *          uses separately, for public reads)
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
 *  ── IF YOU EDIT THIS SCRIPT AFTER THE FIRST DEPLOYMENT ──────────────────
 *  Deploy → Manage deployments → pencil icon → Version: "New version" →
 *  Deploy — the same rule as the other two scripts. Editing the code
 *  alone changes nothing live.
 */

/* ---------- settings ------------------------------------------------------ */

var NOTIFY_EMAIL = 'fcisternas@cuhk.edu.hk';
var SEND_AS_NAME = 'Francisco Cisternas — Website';

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
  var email = str(data.email);
  if (!email || email.indexOf('@') === -1) return json({ ok: false, error: 'invalid' });

  upsert('forum_newsletter_subscribers', 'email', {
    email: email,
    interests: Array.isArray(data.interests) ? data.interests : [],
  });
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
