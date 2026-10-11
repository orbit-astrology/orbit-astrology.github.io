// set-version.js
// ---------------------------------------------------------------
// Browsers keep copies of files for a while so websites load faster.
// After an update, that can mean a mix of old and new files, and the
// page breaks. The fix: put a version number on every link to our own
// CSS and JavaScript files (for example  js/wheel.js?v=202610112000).
// When the number changes, browsers fetch the new files.
//
// Run before saving an update:   node tools/set-version.js
// ---------------------------------------------------------------

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const now = new Date();
const version = now.toISOString().replace(/[-:T]/g, '').slice(0, 12); // e.g. 202610112000

const SKIP = new Set(['.git', 'node_modules', 'tools', 'tests']);

function files(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...files(path));
    else if (['.html', '.js'].includes(extname(name))) out.push(path);
  }
  return out;
}

// Matches our own relative links to .js or .css files, with or without an old ?v=.
const LINK = /((?:src|href)="|from\s+'|from\s+"|import\s+'|import\s+")((?:\.{1,2}\/|js\/|css\/)[^"'?]+\.(?:js|css))(?:\?v=\d+)?/g;

let changed = 0;
for (const file of files('.')) {
  if (file.includes('vendor')) continue;
  const before = readFileSync(file, 'utf8');
  const after = before.replace(LINK, (_, start, path) => `${start}${path}?v=${version}`);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}
console.log(`Version ${version} set in ${changed} files.`);
