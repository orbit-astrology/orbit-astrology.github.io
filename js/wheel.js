// wheel.js
// ---------------------------------------------------------------
// Draws a chart wheel as an SVG picture, from real chart data.
//
// How the picture is laid out (from the outside in):
//   290 → 232  the 12 signs, each with a small constellation drawing
//   232 → 192  the sign names
//   192 → 122  houses and the planet symbols
//   122        a small dot at each planet's EXACT position
//   inside     lines for the aspects (angles between planets)
//
// Where things go: like most astrology charts, the Rising sign
// (Ascendant) is on the left and the zodiac runs anticlockwise.
// Without a birth time there's no Ascendant, so 0° Aries is put on
// the left instead.
// ---------------------------------------------------------------

import { SIGNS as SIGN_NAMES } from './astro/settings.js?v=202610201937';
import { PLANETS } from './content/basics.js?v=202610201937';

const C = 300;           // centre of the 600 × 600 drawing
const SVG_NS = 'http://www.w3.org/2000/svg';
const TEXT = '︎';   // asks phones to draw symbols as text, not emoji

// A point at distance r from the centre, at angle deg (0° = right,
// counting anticlockwise, like in maths class).
function point(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C - r * Math.sin(a)];
}

// Small simplified star patterns, one per sign. Each pair is
// (sideways offset in degrees, outward offset in px) from the
// middle of that sign's band.
const CONSTELLATIONS = [
  [[-14, 4], [-4, -2], [6, 0], [14, -6]],
  [[-14, -6], [-4, 0], [6, -2], [10, 6], [-4, 0], [-8, 8]],
  [[-10, -8], [-10, 8], [-10, 0], [10, 0], [10, -8], [10, 8]],
  [[-12, -4], [0, 0], [8, -8], [0, 0], [6, 8]],
  [[-14, 6], [-6, -2], [0, -8], [8, -6], [10, 2], [4, 6], [-6, -2]],
  [[-14, -6], [-6, 0], [2, -4], [8, 4], [14, 0]],
  [[-12, 6], [-6, -6], [6, -6], [12, 6]],
  [[-14, -6], [-8, 0], [0, 4], [8, 4], [12, -2], [14, -8]],
  [[-12, 8], [-4, 0], [4, -4], [12, -8], [4, -4], [6, 6]],
  [[-14, -4], [-2, 6], [12, 2], [10, -6], [-14, -4]],
  [[-14, -2], [-6, 4], [2, -2], [10, 4], [14, -2]],
  [[-14, -6], [-4, 0], [4, 2], [14, 8], [4, 2], [10, -6]],
];

// The outline of one slice of a ring (for example, the Scorpio part
// of the sign ring), from angle a1 to a2 between radius inner and outer.
// Used as an invisible shape you can hover.
function slice(inner, outer, a1, a2) {
  const span = ((a2 - a1) % 360 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  const [ox1, oy1] = point(outer, a1);
  const [ox2, oy2] = point(outer, a1 + span);
  const [ix2, iy2] = point(inner, a1 + span);
  const [ix1, iy1] = point(inner, a1);
  const f = (n) => n.toFixed(1);
  return `M${f(ox1)} ${f(oy1)} A${outer} ${outer} 0 ${large} 0 ${f(ox2)} ${f(oy2)} ` +
         `L${f(ix2)} ${f(iy2)} A${inner} ${inner} 0 ${large} 1 ${f(ix1)} ${f(iy1)} Z`;
}

function el(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

// Keep planet symbols from sitting on top of each other: if two are
// closer than `gap` degrees, nudge them apart. Their exact dots stay
// put; a thin line joins each symbol to its real position.
function spread(items, gap = 8) {
  if (items.length < 2) return items;
  const sorted = [...items].sort((a, b) => a.angle - b.angle);
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      const b = sorted[(i + 1) % sorted.length];
      let d = b.shown - a.shown;
      if (i === sorted.length - 1) d += 360;
      if (d < gap) {
        const push = (gap - d) / 2;
        a.shown -= push;
        b.shown += push;
      }
    }
  }
  return sorted;
}

/**
 * chart   – the object from calculateChart()
 * options – {
 *   aspects: true,        draw the chart's own aspect lines
 *   houses: true,         draw the houses (when the birth time is known)
 *   only: ['sun', …],     draw only these planets (default: all)
 *   label: 'text for screen readers',
 *   partner: { chart, aspects }   a second person (Connections):
 *       their planets go on an inner ring, and `aspects` (from
 *       findCrossAspects) are drawn as lines between the two people.
 * }
 * Returns an <svg> element.
 */
export function drawWheel(chart, options = {}) {
  const showAspects = options.aspects !== false;
  const showHouses = options.houses !== false;

  // Which longitude goes on the left (180° on screen)?
  const left = chart.angles ? chart.angles.ascendant.longitude : 0;
  const screen = (lon) => ((180 + lon - left) % 360 + 360) % 360;

  const svg = el('svg', { viewBox: '0 0 600 600', class: 'wheel', role: 'img' });
  // A description for screen readers. (aria-label instead of <title>,
  // because browsers show a <title> as a tooltip that covers the wheel.)
  svg.setAttribute('aria-label', options.label || 'Chart wheel');

  // Rings
  for (const [r, cls] of [[290, 'ring'], [232, 'ring soft'], [192, 'ring soft'], [122, 'ring faint']]) {
    svg.append(el('circle', { cx: C, cy: C, r, class: cls }));
  }

  // Invisible hover areas for each sign and house (My Chart page only).
  if (options.hoverAreas) {
    const areas = el('g', { class: 'hover-areas' });
    SIGN_NAMES.forEach((name, i) => {
      areas.append(el('path', { d: slice(192, 290, screen(i * 30), screen(i * 30 + 30)), class: 'hit', 'data-sign': name }));
    });
    if (showHouses && chart.houses) {
      chart.houses.forEach((h, i) => {
        const next = chart.houses[(i + 1) % 12].longitude;
        areas.append(el('path', { d: slice(122, 192, screen(h.longitude), screen(next)), class: 'hit', 'data-house': String(h.number) }));
      });
    }
    svg.append(areas);
  }

  // Signs: dividers, constellations and names
  const signs = el('g', { class: 'signs' });
  SIGN_NAMES.forEach((name, i) => {
    const start = screen(i * 30);
    const [x1, y1] = point(192, start);
    const [x2, y2] = point(290, start);
    signs.append(el('line', { x1, y1, x2, y2, class: 'divider' }));

    const mid = screen(i * 30 + 15);
    const pts = CONSTELLATIONS[i].map(([side, out]) => point(261 + out, mid + side * 0.75));
    signs.append(el('polyline', { points: pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' '), class: 'constellation' }));
    const seen = new Set();
    for (const [x, y] of pts) {
      const k = `${x.toFixed(1)},${y.toFixed(1)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      signs.append(el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 1.6, class: 'star' }));
    }

    const [tx, ty] = point(212, mid);
    // Keep the name running along the circle. On the bottom half it
    // would be upside down, so turn it round (180°) to read normally.
    const bottomHalf = mid > 180 && mid < 360;
    const rotation = 90 - mid + (bottomHalf ? 180 : 0);
    signs.append(el('text', {
      x: tx.toFixed(1), y: ty.toFixed(1), class: 'sign-name',
      transform: `rotate(${rotation.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})`,
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
    }, name.toUpperCase()));
  });
  svg.append(signs);

  // Houses (only when the birth time is known)
  if (showHouses && chart.houses) {
    const houses = el('g', { class: 'houses' });
    chart.houses.forEach((h, i) => {
      const angle = screen(h.longitude);
      const [x1, y1] = point(122, angle);
      const [x2, y2] = point(192, angle);
      const isAngle = i % 3 === 0; // houses 1, 4, 7, 10 start at the four angles
      houses.append(el('line', { x1, y1, x2, y2, class: isAngle ? 'cusp angle' : 'cusp' }));
      const next = chart.houses[(i + 1) % 12].longitude;
      const middle = h.longitude + (((next - h.longitude) % 360) + 360) % 360 / 2;
      const [nx, ny] = point(132, screen(middle));
      houses.append(el('text', { x: nx.toFixed(1), y: ny.toFixed(1), class: 'house-number', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, String(h.number)));
    });
    const [ax, ay] = point(296, 180);
    houses.append(el('text', { x: (ax - 4).toFixed(1), y: ay.toFixed(1), class: 'angle-label', 'text-anchor': 'end', 'dominant-baseline': 'central', 'data-angle': 'rising' }, 'ASC'));
    const mcAngle = screen(chart.angles.midheaven.longitude);
    const [mx, my] = point(300, mcAngle);
    houses.append(el('text', { x: mx.toFixed(1), y: (my - 6).toFixed(1), class: 'angle-label', 'text-anchor': 'middle', 'data-angle': 'midheaven' }, 'MC'));
    svg.append(houses);
  }

  // Aspects: lines between the exact planet positions. Tense angles
  // (square, opposition) are solid; easy ones (trine, sextile) dashed,
  // so the meaning doesn't depend on colour alone.
  if (showAspects) {
    const lines = el('g', { class: 'aspects' });
    const lonOf = Object.fromEntries(chart.bodies.map((b) => [b.id, b.longitude]));
    for (const a of chart.aspects) {
      if (a.type === 'conjunction') continue; // same spot: nothing to draw
      const [x1, y1] = point(122, screen(lonOf[a.from]));
      const [x2, y2] = point(122, screen(lonOf[a.to]));
      lines.append(el('line', { x1, y1, x2, y2, class: `aspect ${a.type}`, 'data-aspect': a.id, 'data-from': a.from, 'data-to': a.to }));
    }
    svg.append(lines);
  }

  // The second person (Connections): an inner ring with their planets,
  // and lines between the two people's planets.
  const keep = (b) => !options.only || options.only.includes(b.id);
  const partner = options.partner;
  if (partner) {
    svg.append(el('circle', { cx: C, cy: C, r: 80, class: 'ring partner-ring' }));
    const yours = Object.fromEntries(chart.bodies.map((b) => [b.id, b.longitude]));
    const theirs = Object.fromEntries(partner.chart.bodies.map((b) => [b.id, b.longitude]));
    const lines = el('g', { class: 'aspects' });
    const hits = el('g', { class: 'aspect-hits' });
    for (const a of partner.aspects) {
      if (a.type === 'conjunction') continue;
      const [x1, y1] = point(80, screen(yours[a.from]));
      const [x2, y2] = point(80, screen(theirs[a.to]));
      lines.append(el('line', { x1, y1, x2, y2, class: `aspect ${a.type}`, 'data-aspect': a.id, 'data-from': a.from, 'data-to': a.to }));
      // A wider invisible copy of the line, so it's easy to hover or tap.
      hits.append(el('line', { x1, y1, x2, y2, class: 'aspect-hit', 'data-aspect': a.id }));
    }
    svg.append(lines, hits);
  }

  svg.append(drawPlanets(chart.bodies.filter(keep), screen, { dot: 122, symbol: 160, leader: 146, person: 'you' }));
  if (partner) {
    svg.append(drawPlanets(partner.chart.bodies.filter(keep), screen, { dot: 80, symbol: 101, leader: 92, person: 'them', gap: 12 }));
  }

  return svg;
}

// Planets: an exact dot, a symbol nearby, and a thin line between
// them when the symbol had to be nudged sideways.
// `at` says how far from the centre each part goes, and whose planets
// these are ('you' or 'them'), so the page can tell them apart.
function drawPlanets(bodies, screen, at) {
  const planets = el('g', { class: `planets ${at.person}` });
  const placed = spread(bodies.map((b) => ({ body: b, angle: screen(b.longitude), shown: screen(b.longitude) })), at.gap);
  for (const { body, angle, shown } of placed) {
    const g = el('g', { class: 'planet', 'data-body': body.id, 'data-person': at.person });
    const [dx, dy] = point(at.dot, angle);
    const [sx, sy] = point(at.symbol, shown);
    if (Math.abs(shown - angle) > 0.5) {
      const [lx, ly] = point(at.leader, shown);
      g.append(el('line', { x1: dx.toFixed(1), y1: dy.toFixed(1), x2: lx.toFixed(1), y2: ly.toFixed(1), class: 'leader' }));
    }
    g.append(el('circle', { cx: dx.toFixed(1), cy: dy.toFixed(1), r: 2.6, class: 'planet-dot' }));
    // A larger invisible circle around the symbol, so it's easy to hover or tap.
    g.append(el('circle', { cx: sx.toFixed(1), cy: sy.toFixed(1), r: at.person === 'them' ? 12 : 15, class: 'planet-hit' }));
    g.append(el('text', { x: sx.toFixed(1), y: sy.toFixed(1), class: 'planet-symbol', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, PLANETS[body.id].symbol + TEXT));
    planets.append(g);
  }
  return planets;
}
