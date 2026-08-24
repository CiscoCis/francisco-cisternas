/* eslint-disable */
/**
 * Runs before `npm install` (see the "preinstall" script in package.json).
 *
 * Next.js 16 requires Node 20.9 or newer. On an older Node the install does
 * not fail cleanly — it prints a confusing lockfile warning and then grinds
 * for minutes fetching platform variants of `sharp` it will never use. This
 * turns that into one clear sentence.
 *
 * Written in ES5 with no dependencies so it runs on any Node version.
 */
var REQUIRED_MAJOR = 20;
var REQUIRED = '20.9.0';

var current = process.versions.node;
var parts = current.split('.');
var major = parseInt(parts[0], 10);
var minor = parseInt(parts[1], 10);

var tooOld = major < REQUIRED_MAJOR || (major === REQUIRED_MAJOR && minor < 9);

if (tooOld) {
  var line = '\n' + Array(72).join('=') + '\n';
  process.stderr.write(
    line +
      '  This project needs Node ' +
      REQUIRED +
      ' or newer. You are on Node ' +
      current +
      '.\n' +
      line +
      '\n' +
      '  Install a current Node, then run npm install again.\n\n' +
      '  macOS — pick whichever you prefer:\n\n' +
      '    Installer   https://nodejs.org  (download the LTS .pkg and run it)\n' +
      '    Homebrew    brew install node@22\n' +
      '                brew link --overwrite --force node@22\n' +
      '    nvm         nvm install 22 && nvm use 22\n\n' +
      '  Windows:\n\n' +
      '    Installer   https://nodejs.org  (download the LTS .msi and run it)\n\n' +
      '  Then confirm with:  node -v     (should print v20.9.0 or higher)\n' +
      '                      npm -v      (should print 10 or higher)\n\n' +
      '  Note: if your prompt starts with "(base)" you are inside a conda\n' +
      '  environment, which may be supplying the old Node. Run\n' +
      '  "conda deactivate" first, or install Node inside that environment.\n' +
      '\n'
  );
  process.exit(1);
}
