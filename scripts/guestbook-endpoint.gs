/**
 * =========================================================================
 *  "Stay Connected" messages → Google Sheet
 * =========================================================================
 *
 *  A third, separate Google Apps Script — distinct from the contact form
 *  (google-sheets-endpoint.gs) and the analytics backend
 *  (analytics-dashboard-endpoint.gs). This one receives "Stay Connected"
 *  messages from students/former students on the public site, writes each
 *  one to its own Google Sheet, and optionally emails a quick heads-up.
 *
 *  ── WHY MESSAGES DON'T APPEAR ON THE SITE THE MOMENT THEY'RE SENT ───────
 *  This is entirely deliberate, not a bug. Every message lands in the
 *  Sheet as "Pending review" — nothing a visitor submits ever appears on
 *  the public site automatically. The professor reads what came in,
 *  decides which ones (if any) he's comfortable making public, and adds
 *  those himself through TinaCMS ("Stay Connected Messages" in the admin
 *  sidebar) — the exact same add-and-publish motion already used for
 *  Videos, Media & Stories, and Recommendations. This keeps a stranger
 *  from ever being able to put text on a professional academic site
 *  without a person reading it first.
 *
 *  ── SETUP (about ten minutes, once — very similar to the contact form) ──
 *
 *   1. Create a new, blank Google Sheet (any name — "Stay Connected
 *      Messages" is a good one). Keep it separate from the "Website
 *      Communication" and "Website Analytics" sheets already in use.
 *
 *   2. In that Sheet's menu bar: Extensions → Apps Script. Delete
 *      whatever's in the editor and paste this entire file in.
 *
 *   3. Save (Ctrl/Cmd+S). Give the project any name.
 *
 *   4. Deploy → New deployment → gear icon → Web app.
 *        Description      →  Stay Connected messages
 *        Execute as       →  Me
 *        Who has access   →  Anyone   ← same reasoning as the other two
 *                                        scripts: anything else and the
 *                                        website's requests never arrive.
 *      Deploy, authorize when prompted (the same click-through as before).
 *      Copy the Web app URL (…/exec).
 *
 *   5. Add to `.env.local`:
 *        NEXT_PUBLIC_GUESTBOOK_ENDPOINT=<that URL>
 *      and, for the live site, the same URL as a GitHub repository
 *      Variable named GUESTBOOK_ENDPOINT (no NEXT_PUBLIC_ prefix there).
 *
 *   6. Restart `npm run dev`, submit a real test message through the
 *      "Stay Connected" section, and confirm a row appears in the Sheet.
 *
 *  ── IF YOU EVER EDIT THIS SCRIPT AFTER THE FIRST DEPLOYMENT ─────────────
 *  Deploy → Manage deployments → pencil icon → Version: New version →
 *  Deploy — exactly like the other two scripts. Editing the code alone
 *  changes nothing live.
 *
 *  ── PUBLISHING A MESSAGE, ONCE YOU'VE READ IT ────────────────────────────
 *   1. In the Sheet, find a message worth making public.
 *   2. In `/admin` → Stay Connected Messages → + New.
 *   3. Copy the name (or leave blank for "Anonymous"), programme,
 *      graduation year, and message text across.
 *   4. Leave "Draft" unchecked and save — it's now live on the site.
 *   5. Back in the Sheet, update that row's Status column to "Published"
 *      so you don't reconsider the same message twice later.
 *
 *  ── COLUMNS ───────────────────────────────────────────────────────────
 *  Date & Time | Name | Programme | Graduation Year | Message | Status | Page
 */

/* ---------- settings ------------------------------------------------------ */

/** Optional heads-up email whenever a new message comes in. Set to '' to
 *  turn this off (the Sheet row is still written either way). */
var NOTIFY_EMAIL = 'fcisternas@cuhk.edu.hk';

/** Display name shown as the sender on the notification email. */
var SEND_AS_NAME = 'Francisco Cisternas — Website';

var SHEET_NAME = 'Messages';
var INITIAL_STATUS = 'Pending review';

var HEADERS = [
  'Date & Time',
  'Name',
  'Programme',
  'Graduation Year',
  'Message',
  'Status',
  'Page',
];

/* ---------- handler ------------------------------------------------------ */

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    var name = String(data.name || '').trim() || 'Anonymous';
    var programme = String(data.programme || '').trim();
    var graduationYear = String(data.graduationYear || '').trim();
    var message = String(data.message || '').trim();
    var page = String(data.page || '').trim();

    if (!message) {
      return json({ ok: false, error: 'missing message' });
    }
    // Crude length guards so a runaway script/bot cannot fill the sheet.
    if (message.length > 4000 || name.length > 200 || programme.length > 200) {
      return json({ ok: false, error: 'too long' });
    }

    var now = new Date();
    var whenReadable = Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      'd MMMM yyyy, h:mm a'
    );

    var sheet = getSheet();
    sheet.appendRow([
      whenReadable,
      name,
      programme,
      graduationYear,
      message,
      INITIAL_STATUS,
      page,
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        name: SEND_AS_NAME,
        subject: 'New "Stay Connected" message' + (name !== 'Anonymous' ? ' from ' + name : ''),
        body:
          name +
          (programme ? ' (' + programme + (graduationYear ? ', ' + graduationYear : '') + ')' : '') +
          ' wrote on ' + whenReadable + ':\n\n' +
          message +
          '\n\n—\nThis is saved as "Pending review" in the Stay Connected Messages Sheet. ' +
          'Publish it (or not) from the website admin whenever you like — nothing here goes live on its own.',
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
    'This endpoint receives "Stay Connected" messages. Nothing to see here.'
  ).setMimeType(ContentService.MimeType.TEXT);
}

/* ---------- helpers ------------------------------------------------------ */

/** Set this once, after step 1 of the setup instructions above — the ID
 *  from the Sheet's own URL, between /d/ and /edit. */
var SPREADSHEET_ID = '';

function getSheet() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

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
