// tour.js
// ---------------------------------------------------------------
// "Watch your chart build itself" (My Chart).
//
// The first time you open My Chart, the wheel appears in steps:
//   1. the signs   2. your planets   3. the houses   4. the lines
// with one short, personal sentence for each. You can press Next,
// skip it, or watch it again later with the button under the title.
//
// How it works: every layer of the wheel is its own SVG group
// (<g class="signs">, <g class="planets">…). During the tour the
// wheel gets the class "touring", which hides all layers; each step
// adds "tour-on" to one more layer so it fades in. The CSS for this
// is in css/chart.css.
// ---------------------------------------------------------------

const DONE_KEY = 'orbit.tour-done';

export function tourWasSeen() {
  try { return localStorage.getItem(DONE_KEY) === 'yes'; } catch { return true; }
}

/**
 * svg   – the chart wheel
 * panel – the box where the step text appears (inside the "How to read" column)
 * steps – [{ layers: ['signs'], title, text }] in order
 * onEnd – called when the tour finishes or is skipped
 */
export function runTour({ svg, panel, steps, onEnd }) {
  const layers = (names) => names.flatMap((n) => [...svg.querySelectorAll(`:scope > .${n}`)]);
  const all = layers(['signs', 'houses', 'aspects', 'planets', 'hover-areas']);
  let index = -1;

  svg.classList.add('touring');
  panel.hidden = false;

  const eyebrow = panel.querySelector('.tour-step');
  const title = panel.querySelector('.tour-title');
  const text = panel.querySelector('.tour-text');
  const next = panel.querySelector('.tour-next');
  const skip = panel.querySelector('.tour-skip');
  const dots = panel.querySelector('.tour-dots');

  // One small square per step, filled in as you go.
  dots.replaceChildren(...steps.map(() => document.createElement('span')));

  function show(i) {
    index = i;
    const step = steps[i];
    // Earlier layers stay but go quiet; this step's layer is bright.
    for (const g of all) g.classList.remove('tour-on', 'tour-past');
    steps.slice(0, i).forEach((s) => layers(s.layers).forEach((g) => g.classList.add('tour-past')));
    layers(step.layers).forEach((g) => g.classList.add('tour-on'));

    eyebrow.textContent = `Step ${i + 1} of ${steps.length}`;
    title.textContent = step.title;
    text.textContent = step.text;
    [...dots.children].forEach((d, n) => d.classList.toggle('done', n <= i));
    next.textContent = i === steps.length - 1 ? 'Explore my chart' : 'Next →';
    next.focus({ preventScroll: true });
  }

  function end() {
    svg.classList.remove('touring');
    for (const g of all) g.classList.remove('tour-on', 'tour-past');
    panel.hidden = true;
    next.removeEventListener('click', onNext);
    skip.removeEventListener('click', end);
    document.removeEventListener('keydown', onKey);
    try { localStorage.setItem(DONE_KEY, 'yes'); } catch { /* not saved: it may show again */ }
    onEnd?.();
  }

  function onNext() {
    if (index < steps.length - 1) show(index + 1);
    else end();
  }
  function onKey(e) {
    if (e.key === 'Escape') end();
  }

  next.addEventListener('click', onNext);
  skip.addEventListener('click', end);
  document.addEventListener('keydown', onKey);
  show(0);
}
