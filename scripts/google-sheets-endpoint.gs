/**
 * =========================================================================
 *  Contact form → Google Sheet
 *  Change requirements §10
 * =========================================================================
 *
 *  This is a Google Apps Script, not part of the website build. It receives
 *  each contact-form submission, appends a row to a Google Sheet, emails
 *  you a copy, and sends the visitor a short automatic acknowledgement.
 *
 *  ── WHY "Compose message" SHOWS ON THE SITE INSTEAD OF "Send message" ───
 *  Nothing about this is broken. The website checks, at build time, whether
 *  it has been given a live URL for this script. Until the six steps below
 *  are done — ALL SIX, not just editing this file — it has no URL, so it
 *  shows "Compose message" and opens the visitor's own email app instead.
 *  That is a deliberate, honest fallback: it never pretends to save
 *  something it did not. Editing this .gs file in the repository changes
 *  nothing on its own — it is source code sitting on disk until you paste
 *  it into an actual Apps Script project and deploy it, which only someone
 *  logged into the Google account can do. No amount of code-editing here
 *  substitutes for doing that once, by hand, in your browser.
 *
 *  ── SETUP (about ten minutes, once) ─────────────────────────────────────
 *
 *   1. Open the Google Sheet named "Website Communication".
 *      (If it does not exist yet: create it now, in Google Sheets.)
 *
 *   2. In that Sheet's menu bar:  Extensions → Apps Script.
 *      This opens a separate code editor tied to this specific Sheet.
 *      Select ALL the existing text in that editor and delete it, then
 *      paste this ENTIRE file in from the top comment to the last line.
 *
 *   3. Save (Ctrl/Cmd+S, or the disk icon). Give the project any name.
 *
 *   4. Still in the Apps Script editor:  Deploy → New deployment.
 *        Click the gear icon next to "Select type" → choose  Web app.
 *        Description      →  Contact form
 *        Execute as       →  Me
 *        Who has access   →  Anyone            ← this exact setting matters;
 *                                                 anything else and the
 *                                                 website's requests get
 *                                                 rejected before they
 *                                                 reach this script.
 *      Click Deploy. Google will ask you to authorize the script the first
 *      time — click through "Advanced" → "Go to [project name] (unsafe)"
 *      if it warns you; this warning is normal for a script you wrote
 *      yourself and have not published to the Marketplace.
 *      When it finishes, copy the "Web app" URL shown. It looks like:
 *        https://script.google.com/macros/s/AKfycb…/exec
 *      This is the ONE piece of information the website needs from all of
 *      this — copy it somewhere safe before closing the dialog.
 *
 *   5. In the website project (cisternas-website-source/), create a file
 *      named exactly  .env.local  in the project root (next to
 *      package.json — NOT inside src/) containing this one line, with the
 *      URL from step 4 in place of the placeholder:
 *
 *        NEXT_PUBLIC_CONTACT_ENDPOINT=https://script.google.com/macros/s/AKfycb…/exec
 *
 *      This makes it work when you run the site locally (`npm run dev`).
 *      For the LIVE, deployed site you additionally need to add the same
 *      URL on GitHub: the repository's Settings → Secrets and variables →
 *      Actions → Variables tab → New repository variable → name it
 *      CONTACT_ENDPOINT (no NEXT_PUBLIC_ prefix there) → paste the URL as
 *      its value. The next push/deploy picks it up automatically. Skipping
 *      this second half is the single most common reason the LIVE site
 *      still shows "Compose message" even after `.env.local` is set
 *      locally — `.env.local` only affects your own machine.
 *
 *   6. Restart `npm run dev` (env files are only read at startup), submit
 *      the form as a real test, and check that a row appears in the
 *      Sheet and that both emails (to you, and the automatic one back to
 *      the test address you used) arrive.
 *
 *  ── IF YOU EVER EDIT THIS SCRIPT AFTER THE FIRST DEPLOYMENT ─────────────
 *  Deploy → Manage deployments → pencil icon on the existing one →
 *  Version: New version → Deploy. Editing the code without doing this
 *  changes nothing live. Creating a brand new deployment instead of a new
 *  version of the existing one gives you a second, different URL — the
 *  website would still be pointed at the old one.
 *
 *  ── COLUMNS ─────────────────────────────────────────────────────────────
 *  Date & Time | Name | Email | Purpose | Description | Status | Page
 *
 *  `Date & Time` is written as e.g. "25 August 2026, 3:47 PM" — a plain,
 *  human-readable string, not a raw date serial. `Status` starts as "New"
 *  and is there for you to update by hand (Replied, Archived, …); nothing
 *  in this script ever overwrites a status you have already changed.
 */

/* ---------- settings ----------------------------------------------------- */

/** Where the "someone contacted you" notification goes. Set to '' to turn
 *  this off (the Sheet row is still written either way). */
var NOTIFY_EMAIL = 'fcisternas@cuhk.edu.hk';

/** Whether the visitor gets an automatic "message received" reply. */
var SEND_AUTO_REPLY = true;

/** Signs the automatic reply to visitors. */
var REPLY_FROM_NAME = 'Francisco Cisternas';

/** The tab in the spreadsheet that rows are appended to. */
var SHEET_NAME = 'Messages';

/** Value written into the Status column for every new message. */
var INITIAL_STATUS = 'New';

var HEADERS = [
  'Date & Time',
  'Name',
  'Email',
  'Purpose',
  'Description',
  'Status',
  'Page',
];

/* ---------- handler ------------------------------------------------------ */

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    var name = String(data.name || '').trim();
    var email = String(data.email || '').trim();
    var subject = String(data.subject || '').trim();
    var message = String(data.message || '').trim();
    var page = String(data.page || '').trim();

    // Minimum viable message. Anything less is a bot or a mis-fire.
    if (!name || !email || !message) {
      return json({ ok: false, error: 'missing required fields' });
    }
    // Crude length guard so a runaway script cannot fill the sheet.
    if (message.length > 8000 || name.length > 200 || email.length > 320) {
      return json({ ok: false, error: 'too long' });
    }

    var now = new Date();
    var whenReadable = Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "d MMMM yyyy, h:mm a"
    );

    var sheet = getSheet();
    sheet.appendRow([
      whenReadable,
      name,
      email,
      subject || '(no subject given)',
      message,
      INITIAL_STATUS,
      page,
    ]);

    // Tell the professor someone reached out.
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        replyTo: email,
        subject: 'Website message: ' + (subject || 'no subject'),
        body:
          name +
          ' <' +
          email +
          '> wrote on ' + whenReadable + ':\n\n' +
          message +
          '\n\n—\nSent from ' +
          (page || 'the website contact form') +
          '\nThis message has also been saved to the "Website Communication" Sheet.',
      });
    }

    // Tell the visitor their message arrived, and that a reply is coming.
    if (SEND_AUTO_REPLY) {
      MailApp.sendEmail({
        to: email,
        subject: 'Thank you for reaching out — ' + REPLY_FROM_NAME,
        body:
          'Dear ' + name + ',\n\n' +
          'Thank you for getting in touch' +
          (subject ? ' about "' + subject + '"' : '') +
          '. This is an automatic confirmation that your message has been ' +
          'received.\n\n' +
          REPLY_FROM_NAME + ' reviews messages personally and will reply ' +
          'to you as soon as he can.\n\n' +
          'Best regards,\n' +
          REPLY_FROM_NAME +
          '\n\n—\nThis is an automated acknowledgement; there is no need to ' +
          'reply to it directly. If you would like to add anything, just ' +
          'use the contact form again.',
      });
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Visiting the URL in a browser should say something useful, not error. */
function doGet() {
  return ContentService.createTextOutput(
    'This endpoint receives contact-form submissions. Nothing to see here.'
  ).setMimeType(ContentService.MimeType.TEXT);
}

/* ---------- helpers ------------------------------------------------------ */

/** The spreadsheet every submission is written to, regardless of which
 *  document this script happens to be opened/edited from — the Google
 *  Sheet named "Website Communication". SHEET_NAME above is the tab
 *  inside it, not the spreadsheet's own name. */
var SPREADSHEET_ID = '1kfrXgzzzn6wnM3MzTWe2Z8FJi8cXZNj00DrRNfnHMMg';

function getSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  // Write the header row once, and freeze it.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
