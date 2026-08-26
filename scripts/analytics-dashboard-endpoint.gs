/**
 * =========================================================================
 *  Analytics dashboard backend (feeds the "Analytics" screen inside
 *  TinaCMS's admin — Settings sidebar → DASHBOARD → Analytics)
 * =========================================================================
 *
 *  This is a separate Google Apps Script from the contact-form one
 *  (google-sheets-endpoint.gs) — they do unrelated things and should stay
 *  as separate deployments.
 *
 *  WHY THIS EXISTS AT ALL: the Analytics screen needs a GoatCounter API
 *  token to fetch traffic data, but that screen's code ships as public
 *  static files (public/admin/*.js) — anyone can read it, logged into
 *  Tina or not. A token embedded there would be readable by anyone who
 *  opens the browser's dev tools. This script holds that token instead,
 *  on Google's servers, and the screen only ever talks to THIS script —
 *  never to GoatCounter directly.
 *
 *  What it does:
 *   - `doGet` with `?action=summary` — live pass-through of GoatCounter's
 *     own total-count and per-country stats. Always fresh.
 *   - `doGet` with `?action=recent` — the most recent individual visits
 *     (timestamp, country, referrer, page — no IP, no name; GoatCounter
 *     doesn't collect that). GoatCounter only offers this as a batch
 *     export, not a live feed, so this reads from a Sheet tab that a
 *     once-a-day trigger keeps refreshed (see `refreshRecentVisits`
 *     below) — the response says when it was last updated.
 *   - Every request must include the shared secret (see step 5) or it's
 *     rejected outright.
 *
 *  ── SETUP (about ten minutes, once) ─────────────────────────────────────
 *
 *   1. In GoatCounter, click your email/username in the top-right menu →
 *      API (not under "Settings" — that page doesn't have it), then "Add
 *      new API Token". Check "Read statistics" and "Export" only, and
 *      scope it to this one site rather than "All sites". Copy the token.
 *
 *   2. Create a new, blank Google Sheet (any name, e.g. "Website
 *      Analytics"). This is separate from the "Website Communication"
 *      sheet the contact form uses — keeps the two concerns apart.
 *      Copy its ID out of the URL: the long string between /d/ and /edit
 *      in `https://docs.google.com/spreadsheets/d/<THIS PART>/edit`.
 *
 *   3. In that new Sheet's menu: Extensions → Apps Script. Delete
 *      whatever's in the editor and paste this entire file in.
 *
 *   4. Still in the Apps Script editor, open Project Settings (the gear
 *      icon on the left) → "Script Properties" → add three properties:
 *        GOATCOUNTER_SITE     →  the site code only, e.g. franciscocisternas
 *                                 (not the full URL — just the subdomain part)
 *        GOATCOUNTER_TOKEN    →  the token from step 1
 *        SHARED_SECRET        →  make up any long random string yourself
 *                                 (this is what the website sends back to
 *                                 prove a request is really coming from the
 *                                 Analytics screen, not a stranger poking
 *                                 at the URL) — write it down, you'll need
 *                                 it again in step 7.
 *        SPREADSHEET_ID       →  the ID from step 2.
 *
 *   5. Back in the code editor, Deploy → New deployment → gear icon →
 *      Web app.
 *        Description      →  Analytics dashboard
 *        Execute as       →  Me
 *        Who has access   →  Anyone   ← same reasoning as the contact
 *                                        form: anything else and the
 *                                        website's requests get rejected
 *                                        before reaching this script. The
 *                                        SHARED_SECRET above is what
 *                                        actually keeps this endpoint
 *                                        private, not this setting.
 *      Deploy, authorize when prompted (same "Advanced → Go to
 *      [project] (unsafe)" click-through as before — normal for a script
 *      you wrote yourself). Copy the Web app URL.
 *
 *   6. Still in the Apps Script editor: Triggers (clock icon, left
 *      sidebar) → Add Trigger → choose function `refreshRecentVisits`,
 *      event source "Time-driven", type "Day timer", any time of day.
 *      Save. This is what keeps the "recent visits" list from going stale
 *      — it runs once a day from here on with no further action needed.
 *      Optionally run it once manually now (Run → refreshRecentVisits,
 *      from this editor) so the Sheet has real data immediately instead
 *      of waiting for the first scheduled run.
 *
 *   7. In the website project, add to `.env.local`:
 *        NEXT_PUBLIC_ANALYTICS_ENDPOINT=<the Web app URL from step 5>
 *        NEXT_PUBLIC_ANALYTICS_SECRET=<the SHARED_SECRET from step 4>
 *      And the same two, without the NEXT_PUBLIC_ prefix removed (Tina's
 *      build reads these the same way the main site reads
 *      NEXT_PUBLIC_TINA_CLIENT_ID) — exact wiring lives in tina/config.ts.
 *      For the live site, add both as GitHub repo variables the same way
 *      CONTACT_ENDPOINT already is (Settings → Secrets and variables →
 *      Actions → Variables).
 *
 *  ── IF YOU EVER EDIT THIS SCRIPT AFTER THE FIRST DEPLOYMENT ─────────────
 *  Deploy → Manage deployments → pencil icon → Version: New version →
 *  Deploy. Editing the code alone changes nothing live.
 */

/* ---------- settings ------------------------------------------------------ */

/** The tab rows are written to. */
var SHEET_NAME = 'Recent Visits';

/** How many of the most recent visits to keep. */
var MAX_ROWS = 200;

var HEADERS = ['When', 'Country', 'Referrer', 'Page'];

/* ---------- HTTP handler --------------------------------------------------- */

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.secret !== getProp_('SHARED_SECRET')) {
    return json_({ ok: false, error: 'forbidden' });
  }

  try {
    if (params.action === 'summary') return json_(getSummary_());
    if (params.action === 'recent') return json_(getRecent_());
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---------- live, aggregated stats (called on every dashboard open) ------- */

function getSummary_() {
  var total = goatcounterGet_('/api/v0/stats/total');
  var locations = goatcounterGet_('/api/v0/stats/locations');
  var hits = goatcounterGet_('/api/v0/stats/hits?limit=10');

  return {
    ok: true,
    total: total.total || 0,
    byCountry: (locations.stats || []).map(function (row) {
      return { country: row.name || row.id || 'Unknown', count: row.count || 0 };
    }),
    topPages: (hits.hits || []).map(function (row) {
      return { path: row.path || row.title || 'Unknown', count: row.count || 0 };
    }),
  };
}

/* ---------- periodic per-visit log ----------------------------------------- */

function getRecent_() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, updatedAt: null, visits: [] };
  }
  var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var visits = values
    .map(function (row) {
      return { when: row[0], country: row[1], referrer: row[2], page: row[3] };
    })
    .reverse(); // most recent first

  var props = PropertiesService.getScriptProperties();
  return { ok: true, updatedAt: props.getProperty('RECENT_VISITS_UPDATED_AT') || null, visits: visits };
}

/**
 * Run once a day by a time-driven trigger (see setup step 6). Asks
 * GoatCounter to prepare a full export, waits for it (GoatCounter is
 * usually fast for a modest-traffic personal site, but this loop is
 * capped well under Apps Script's execution limit — if a single run
 * genuinely doesn't finish in time, tomorrow's scheduled run just tries
 * again; nothing is left in a stuck state), then replaces the "Recent
 * Visits" tab with the newest MAX_ROWS rows.
 *
 * Column names in the exported CSV are confirmed against a real export
 * the first time this runs — if GoatCounter ever changes them, the
 * `pick_` lookups below fail loudly (via the thrown error surfacing in
 * the trigger's execution log) rather than silently writing wrong data.
 */
function refreshRecentVisits() {
  // GoatCounter's docs say `format` defaults to "csv" when omitted, but the
  // live API actually treats a missing key as an empty string and rejects
  // it ("unknown format") -- so it has to be sent explicitly.
  var created = goatcounterPost_('/api/v0/export', { format: 'csv' });
  var exportId = created.id;
  if (!exportId) throw new Error('GoatCounter did not return an export id');

  var status = created;
  var waited = 0;
  while (!status.finished_at && waited < 4.5 * 60 * 1000) {
    Utilities.sleep(3000);
    waited += 3000;
    status = goatcounterGet_('/api/v0/export/' + exportId);
  }
  if (!status.finished_at) {
    throw new Error('Export did not finish in time; will retry on the next scheduled run');
  }

  var csvText = goatcounterGetRaw_('/api/v0/export/' + exportId + '/download');
  var rows = Utilities.parseCsv(csvText);
  if (rows.length < 2) return; // header only, or empty — nothing to import yet

  var header = rows[0];
  var pathCol = pick_(header, ['path', 'Path']);
  var refCol = pick_(header, ['ref', 'referrer', 'Referrer']);
  var locCol = pick_(header, ['location', 'Location', 'country', 'Country']);
  var timeCol = pick_(header, ['created_at', 'CreatedAt', 'Created At', 'date', 'Date']);

  var dataRows = rows.slice(1);
  var recent = dataRows.slice(Math.max(0, dataRows.length - MAX_ROWS));

  var sheet = getSheet_();
  sheet.clearContents();
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');

  recent.forEach(function (row) {
    sheet.appendRow([
      timeCol >= 0 ? row[timeCol] : '',
      locCol >= 0 ? row[locCol] : '',
      refCol >= 0 ? row[refCol] : '',
      pathCol >= 0 ? row[pathCol] : '',
    ]);
  });

  PropertiesService.getScriptProperties().setProperty(
    'RECENT_VISITS_UPDATED_AT',
    new Date().toISOString()
  );
}

function pick_(header, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var idx = header.indexOf(candidates[i]);
    if (idx !== -1) return idx;
  }
  return -1;
}

/* ---------- GoatCounter API helpers ---------------------------------------- */

function goatcounterBase_() {
  return 'https://' + getProp_('GOATCOUNTER_SITE') + '.goatcounter.com';
}

function goatcounterGet_(path) {
  var res = UrlFetchApp.fetch(goatcounterBase_() + path, {
    headers: { Authorization: 'Bearer ' + getProp_('GOATCOUNTER_TOKEN') },
    muteHttpExceptions: true,
  });
  return JSON.parse(res.getContentText() || '{}');
}

function goatcounterGetRaw_(path) {
  var res = UrlFetchApp.fetch(goatcounterBase_() + path, {
    headers: { Authorization: 'Bearer ' + getProp_('GOATCOUNTER_TOKEN') },
    muteHttpExceptions: true,
  });
  return res.getContentText();
}

function goatcounterPost_(path, body) {
  var res = UrlFetchApp.fetch(goatcounterBase_() + path, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(body || {}),
    headers: { Authorization: 'Bearer ' + getProp_('GOATCOUNTER_TOKEN') },
    muteHttpExceptions: true,
  });
  return JSON.parse(res.getContentText() || '{}');
}

/* ---------- misc helpers ---------------------------------------------------- */

function getProp_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error('Missing script property: ' + name + ' — see setup step 4.');
  return value;
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(getProp_('SPREADSHEET_ID'));
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
