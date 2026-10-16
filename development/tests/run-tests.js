// Run in a terminal with:  node tests/run-tests.js
import { runChecks } from './checks.js';

const results = runChecks();
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  const detail = r.off !== undefined ? `${r.off}′ off (limit ${r.limit}′)` : `expected ${r.reference}, got ${r.actual}`;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.case} · ${r.item} · ${detail}`);
}
console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
