// steady.js
// ---------------------------------------------------------------
// Keeps the page still when you tap something that changes the words
// (a different element, Moon shape, life moment, day, Friendship or
// Romance). The box always keeps the height of its LONGEST version,
// so the lines and sections under it never jump up or down. Only the
// words change.
// ---------------------------------------------------------------

// 1. When every version can be built up front: put them all in the
//    same spot, on top of each other (CSS grid, one cell), and only
//    show the chosen one. The box is automatically as tall as the
//    tallest version, on any screen size.
//    Returns show(i), which shows version i.
export function stack(box, versions) {
  box.classList.add('stack');
  box.replaceChildren(...versions);
  return (i) => {
    versions.forEach((v, n) => {
      const chosen = n === i;
      v.classList.toggle('stack-shown', chosen);
      v.setAttribute('aria-hidden', String(!chosen));
    });
  };
}

// 2. When the versions are drawn one at a time (they're calculated
//    live): draw each one once, out of sight, measure it, and give the
//    box the tallest height as its minimum. `drawEach` is a list of
//    functions that each draw one version; `drawChosen` draws the one
//    to show. Measured again if the window changes size (the text
//    wraps differently).
export function measureTallest(box, drawEach, drawChosen) {
  box.style.minHeight = '';
  let tallest = 0;
  for (const draw of drawEach()) {
    draw();
    tallest = Math.max(tallest, box.offsetHeight);
  }
  drawChosen();
  box.style.minHeight = `${tallest}px`;
}

export function reserveHeight(box, drawEach, drawChosen) {
  const measure = () => measureTallest(box, drawEach, drawChosen);
  measure();
  let waiting = null;
  let width = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === width) return; // phones resize when scrolling; only width matters
    width = window.innerWidth;
    clearTimeout(waiting);
    waiting = setTimeout(measure, 200);
  });
  return measure;
}
