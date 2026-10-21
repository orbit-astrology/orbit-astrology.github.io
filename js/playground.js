// playground.js
// ---------------------------------------------------------------
// The aspect playground: two planets on a circle. The Sun stays at
// the top; you move the Moon around (drag it, or select it and use
// the arrow keys). The angle between them updates live, and when it
// lands near 0°, 60°, 90°, 120° or 180° ORBIT draws the line and
// explains that aspect.
// ---------------------------------------------------------------

import { ASPECTS } from './astro/settings.js?v=202610211818';
import { aspectBetween } from './astro/aspects.js?v=202610211818';
import { ASPECT_TEXT } from './content/basics.js?v=202610211818';

const NS = 'http://www.w3.org/2000/svg';
const C = 200;   // centre of the 400 × 400 drawing
const R = 150;   // circle radius
const TEXT = '︎';

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}
const point = (r, deg) => [C + r * Math.cos((deg * Math.PI) / 180), C - r * Math.sin((deg * Math.PI) / 180)];

export function setUpPlayground(box, readout) {
  const FIXED = 90;     // the Sun, at the top of the circle
  let angle = 15;       // where the Moon starts (degrees, counted like in maths class)

  const svg = el('svg', { viewBox: '0 0 400 400', role: 'group', 'aria-label': 'Aspect playground' });
  svg.append(el('circle', { cx: C, cy: C, r: R, class: 'ring' }));

  // Marks showing where each special angle is, measured from the Sun.
  for (const a of ASPECTS) {
    const sides = a.angle === 0 || a.angle === 180 ? [a.angle] : [a.angle, -a.angle];
    for (const s of sides) {
      const [x1, y1] = point(R - 8, FIXED + s);
      const [x2, y2] = point(R + 8, FIXED + s);
      svg.append(el('line', { x1, y1, x2, y2, class: 'tick' }));
      const [tx, ty] = point(R + 26, FIXED + s);
      if (a.angle !== 0) svg.append(el('text', { x: tx, y: ty, class: 'tick-label', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, `${a.angle}°`));
    }
  }

  const line = el('line', { class: 'link off' });
  svg.append(line);

  const [fx, fy] = point(R, FIXED);
  svg.append(el('circle', { cx: fx, cy: fy, r: 16, class: 'fixed' }));
  svg.append(el('text', { x: fx, y: fy + 1, class: 'glyph', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, '☉' + TEXT));

  const moving = el('circle', {
    r: 16, class: 'moving', tabindex: '0', role: 'slider',
    'aria-label': 'Moon: move it around the circle',
    'aria-valuemin': '0', 'aria-valuemax': '180',
  });
  const movingGlyph = el('text', { class: 'glyph moving-glyph', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, '☽' + TEXT);
  const hit = el('circle', { r: 30, class: 'moving-hit' }); // bigger area, easier to grab with a finger
  svg.append(hit, moving, movingGlyph);
  box.append(svg);

  function separation() {
    const d = Math.abs(((angle - FIXED) % 360 + 360) % 360);
    return d > 180 ? 360 - d : d;
  }

  function update() {
    const [mx, my] = point(R, angle);
    for (const n of [moving, hit]) { n.setAttribute('cx', mx); n.setAttribute('cy', my); }
    movingGlyph.setAttribute('x', mx);
    movingGlyph.setAttribute('y', my + 1);
    line.setAttribute('x1', fx); line.setAttribute('y1', fy);
    line.setAttribute('x2', mx); line.setAttribute('y2', my);

    const sep = Math.round(separation());
    const aspect = aspectBetween(FIXED, angle);
    line.setAttribute('class', aspect
      ? `link ${['trine', 'sextile'].includes(aspect.type) ? 'soft' : ''}`
      : 'link off');

    readout.replaceChildren();
    const big = document.createElement('p');
    big.className = 'angle';
    big.textContent = `${sep}°`;
    readout.append(big);

    if (aspect) {
      const t = ASPECT_TEXT[aspect.type];
      const name = document.createElement('p');
      name.className = 'aspect-name';
      name.textContent = `${t.name[0].toUpperCase() + t.name.slice(1)} (${t.angle}°)`;
      const text = document.createElement('p');
      text.textContent = `The Sun and the Moon are ${t.plain}: ${t.meaning}.`;
      const orb = document.createElement('p');
      orb.className = 'quiet';
      orb.textContent = aspect.orb < 0.5
        ? 'Exact! The closer to exact, the stronger an aspect is.'
        : `${aspect.orb.toFixed(0)}° away from exact. Astrologers allow a little room (called the “orb”); the closer, the stronger.`;
      readout.append(name, text, orb);
      moving.setAttribute('aria-valuetext', `${sep} degrees: ${t.name}, ${t.plain}`);
    } else {
      const nearest = ASPECTS.reduce((best, a) => (Math.abs(sep - a.angle) < Math.abs(sep - best.angle) ? a : best));
      const text = document.createElement('p');
      text.textContent = `No special angle here, so these two planets don’t “talk” to each other. The nearest is the ${nearest.name.toLowerCase()} at ${nearest.angle}°.`;
      readout.append(text);
      moving.setAttribute('aria-valuetext', `${sep} degrees: no aspect`);
    }
    moving.setAttribute('aria-valuenow', String(sep));
  }

  // Dragging with a mouse or finger
  let dragging = false;
  function moveTo(e) {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 400 - C;
    const y = C - ((e.clientY - r.top) / r.height) * 400;
    angle = (Math.atan2(y, x) * 180) / Math.PI;
    update();
  }
  for (const n of [moving, hit]) {
    n.addEventListener('pointerdown', (e) => { dragging = true; n.setPointerCapture(e.pointerId); moving.focus(); moveTo(e); });
    n.addEventListener('pointermove', (e) => { if (dragging) moveTo(e); });
    n.addEventListener('pointerup', () => { dragging = false; });
    n.addEventListener('pointercancel', () => { dragging = false; });
  }

  // Arrow keys: 1° at a time, or 10° with Shift
  moving.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 1;
    if (['ArrowLeft', 'ArrowDown'].includes(e.key)) angle -= step;
    else if (['ArrowRight', 'ArrowUp'].includes(e.key)) angle += step;
    else return;
    e.preventDefault();
    update();
  });

  update();
}
