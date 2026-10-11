// tip-position.js
// ---------------------------------------------------------------
// Where the explanation box goes when you hover something on a wheel
// (My Chart and Connections). It never covers the wheel:
//   1. beside the wheel, on the side of the thing you're pointing at
//      (or the other side, if there's no room)
//   2. otherwise (phones) just below the wheel
//   3. and if that's off the screen, stuck to the top or bottom edge of
//      the screen, away from the thing you're pointing at
// ---------------------------------------------------------------

const GAP = 16; // space between the wheel and the box

export function placeTip(tip, owner, wheel, area) {
  tip.classList.remove('docked', 'docked-top');
  tip.style.top = '0px';
  tip.style.left = '0px';

  const a = area.getBoundingClientRect();  // the box is positioned inside this
  const w = wheel.getBoundingClientRect();  // the wheel itself
  const o = owner.getBoundingClientRect();  // the thing being hovered
  const width = tip.offsetWidth;
  const height = tip.offsetHeight;

  const roomRight = window.innerWidth - w.right - GAP - 8 >= width;
  const roomLeft = w.left - GAP - 8 >= width;
  const ownerOnRight = o.left + o.width / 2 > w.left + w.width / 2;

  if (roomRight || roomLeft) {
    const right = ownerOnRight ? roomRight : !roomLeft;
    const left = right ? w.right + GAP : w.left - GAP - width;
    // Level with the thing you're pointing at, but kept within the wheel's height.
    const middle = o.top + o.height / 2 - height / 2;
    const top = Math.min(Math.max(middle, w.top), Math.max(w.top, w.bottom - height));
    tip.style.left = `${left - a.left}px`;
    tip.style.top = `${top - a.top}px`;
    return;
  }

  // No room at the sides: below the wheel, if that's visible on screen.
  if (w.bottom + GAP + height <= window.innerHeight) {
    tip.style.left = `${Math.max(w.left, 8) - a.left}px`;
    tip.style.top = `${w.bottom + GAP - a.top}px`;
    return;
  }

  // Otherwise stick it to the top or bottom of the screen, whichever is
  // further from the thing you're pointing at, so that stays visible.
  tip.classList.add('docked');
  tip.classList.toggle('docked-top', o.top + o.height / 2 > window.innerHeight / 2);
  tip.style.left = '';
  tip.style.top = '';
}
