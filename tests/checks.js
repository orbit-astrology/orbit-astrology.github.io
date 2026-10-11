// checks.js
// ---------------------------------------------------------------
// Runs every reference case and returns readable results. Used by
// both the terminal test (run-tests.js) and the browser lab page,
// so the same checks can be shown to anyone.
// ---------------------------------------------------------------

import { calculateChart, positionsAt } from '../js/astro/chart.js';
import { localToUtc } from '../js/astro/time.js';
import { REFERENCE_CHARTS, REFERENCE_SKY, TIME_CASES, parsePosition } from './reference-charts.js';

// Allowed difference, in arcminutes (1° = 60′). The reference cuts
// minutes off, so a true value of 12°33.9′ is listed as 12°33′; we
// compare against the middle of that minute.
export const TOLERANCE = { planet: 2, moon: 3, angle: 4 };

function arcminutesOff(actual, reference) {
  const middle = parsePosition(reference) + 0.5 / 60;
  const diff = Math.abs(((actual - middle + 540) % 360) - 180);
  return diff * 60;
}

function compare(caseName, key, actual, reference, kind) {
  const off = arcminutesOff(actual, reference);
  return { case: caseName, item: key, reference, off: Math.round(off * 10) / 10, limit: TOLERANCE[kind], pass: off <= TOLERANCE[kind] };
}

export function runChecks() {
  const results = [];

  for (const ref of REFERENCE_CHARTS) {
    const out = calculateChart(ref.birth);
    if (out.status !== 'ok') {
      results.push({ case: ref.name, item: 'calculation', pass: false, reference: out.message });
      continue;
    }
    const chart = out.chart;
    results.push({ case: ref.name, item: 'UTC time', reference: ref.expectedUtc, actual: chart.utc, pass: chart.utc === ref.expectedUtc });
    for (const b of chart.bodies) {
      if (ref.expected[b.id]) results.push(compare(ref.name, b.name, b.longitude, ref.expected[b.id], b.id === 'moon' ? 'moon' : 'planet'));
    }
    for (const key of ['ascendant', 'midheaven']) {
      if (ref.expected[key]) results.push(compare(ref.name, key === 'ascendant' ? 'Ascendant' : 'Midheaven', chart.angles[key].longitude, ref.expected[key], 'angle'));
    }
    if (ref.expectedHouses) {
      ref.expectedHouses.forEach((reference, i) => {
        results.push(compare(ref.name, `House ${i + 1} cusp`, chart.houses[i].longitude, reference, 'angle'));
      });
    }
    if (ref.expectedRetrograde) {
      const ours = chart.bodies.filter((b) => b.retrograde).map((b) => b.id).sort().join(', ');
      const theirs = [...ref.expectedRetrograde].sort().join(', ');
      results.push({ case: ref.name, item: 'Retrograde planets', reference: theirs, actual: ours, pass: ours === theirs });
    }
  }

  const sky = positionsAt(new Date(REFERENCE_SKY.utc));
  for (const b of sky) {
    results.push(compare('Sky on 28 Sep 2026', b.name, b.longitude, REFERENCE_SKY.expected[b.id], b.id === 'moon' ? 'moon' : 'planet'));
  }

  for (const t of TIME_CASES) {
    const r = localToUtc(t.local, t.timeZone);
    const actual = r.status === 'ok' ? r.utc.toISOString() : r.status;
    results.push({ case: 'Time zones', item: t.label, reference: t.expect, actual, pass: actual === t.expect });
  }

  // Unknown birth time: Vettel's Moon sits at 0° Libra at noon, so
  // earlier that day it was still in Virgo. ORBIT must say so.
  const vettel = REFERENCE_CHARTS[2];
  const unknown = calculateChart({ ...vettel.birth, timeKnown: false });
  const moon = unknown.chart.bodies.find((b) => b.id === 'moon');
  results.push({ case: 'Unknown birth time', item: 'Moon marked uncertain (Virgo or Libra)', reference: 'Virgo, Libra', actual: moon.possibleSigns.join(', '), pass: moon.uncertain && moon.possibleSigns.join(', ') === 'Virgo, Libra' });
  results.push({ case: 'Unknown birth time', item: 'No Ascendant or houses invented', reference: 'none', actual: unknown.chart.angles || unknown.chart.houses ? 'present' : 'none', pass: !unknown.chart.angles && !unknown.chart.houses });

  return results;
}
