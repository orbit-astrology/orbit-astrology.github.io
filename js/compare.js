// compare.js
// ---------------------------------------------------------------
// Compares two people's charts (Connections page).
//
// Both charts come from calculateChart() (js/astro/chart.js), so the
// positions are real. Here we only find the angles between YOUR
// personal planets and THEIR personal planets, using the tighter
// "synastry" orbs from settings.js, and explain each one.
//
// If either birth time is unknown, the Moon (and sometimes other
// planets) could be a few degrees away from where it's drawn. So we
// check each link at the very start and very end of that birth day:
// if it doesn't hold all day, it's marked "might not be exact".
// ---------------------------------------------------------------

import { findCrossAspects } from './astro/aspects.js?v=202610201505';
import { PLANETS } from './content/basics.js?v=202610201505';
import { PERSONAL, PAIRS, LINK_TYPES, THEIR_WHAT, pairKey } from './content/connections.js?v=202610201505';

const nameOf = (id) => id[0].toUpperCase() + id.slice(1);
const personal = (bodies) => bodies.filter((b) => PERSONAL.includes(b.id));

// The possible versions of someone's planets: just one if the time is
// exact, or the start and end of the time window (the whole day when
// the time is unknown, or ± the margin when it's approximate).
function versions(chart) {
  if (!chart.utcRange) return [personal(chart.bodies)]; // exact time
  return [0, 1].map((edge) => personal(chart.bodies).map((b) => ({ ...b, longitude: b.range[edge] })));
}

// All links between two charts, tightest (strongest) first.
export function compareCharts(you, them) {
  const links = findCrossAspects(personal(you.bodies), personal(them.bodies));
  if (!you.utcRange && !them.utcRange) return links; // both times exact

  // Which links hold in every combination of start/end of the day?
  const sets = [];
  for (const a of versions(you)) {
    for (const b of versions(them)) sets.push(new Set(findCrossAspects(a, b).map((l) => l.id)));
  }
  return links.map((l) => ({ ...l, uncertain: !sets.every((s) => s.has(l.id)) }));
}

// A sign, or "Virgo or Libra" when the birth time is unknown and the
// planet changed sign that day.
export function signText(body) {
  return body.uncertain ? body.possibleSigns.join(' or ') : body.sign;
}

// One link, explained in plain words for the chosen lens.
export function explainLink(link, you, them, theirName, lens) {
  const mine = you.bodies.find((b) => b.id === link.from);
  const theirs = them.bodies.find((b) => b.id === link.to);
  const type = LINK_TYPES[link.type];
  const pair = PAIRS[pairKey(link.from, link.to)][lens];
  const feel = type.feel[lens];
  return {
    id: link.id,
    kind: type.kind,
    label: type.label,
    strong: link.orb <= 1.5,
    uncertain: Boolean(link.uncertain),
    plain: type.plain,
    theme: pair.about,
    title: `Your ${nameOf(link.from)} · ${theirName}’s ${nameOf(link.to)}`,
    symbols: [PLANETS[link.from].symbol, PLANETS[link.to].symbol],
    // The facts: the same whichever way you read it.
    facts: `Your ${nameOf(link.from)} (${PLANETS[link.from].what}) in ${signText(mine)} and ${theirName}’s ${nameOf(link.to)} (${THEIR_WHAT[link.to]}) in ${signText(theirs)} are ${type.plain}.`,
    // The meaning: changes with the Friendship / Romance switch.
    meaning: `This link is about ${pair.about}. ${pair.tip} ${feel[0].toUpperCase() + feel.slice(1)}.`,
  };
}

// A short summary: how many links of each kind. Counts, never a score.
export function summarise(links) {
  const count = { easy: 0, tense: 0, blend: 0 };
  for (const l of links) count[LINK_TYPES[l.type].kind]++;
  return count;
}
