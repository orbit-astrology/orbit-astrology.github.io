// constellations.js
// ---------------------------------------------------------------
// The star pattern behind each zodiac sign, drawn as a small picture
// that "draws itself": the lines appear one after another, and each
// star lights up when a line reaches it.
//
// The signs are named after these groups of stars (constellations).
// The positions are real: each star is written as where it sits in
// the sky (right ascension in hours, declination in degrees, the
// sky's version of longitude and latitude). The lines are the usual
// simplified "stick figure" for each one.
//
// Used on My Universe, above your Sun, Moon and Rising signs.
// ---------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

// Each sign: a list of stars [hours, minutes, degrees] and the lines
// between them (each line is a list of star numbers to join in order).
export const CONSTELLATIONS = {
  Aries: {
    stars: [[2, 50.0, 27.26], [2, 7.2, 23.46], [1, 54.6, 20.81], [1, 53.5, 19.29]],
    lines: [[0, 1, 2, 3]],
  },
  Taurus: {
    stars: [[5, 26.3, 28.61], [4, 28.6, 19.18], [4, 22.9, 17.54], [4, 19.8, 15.63], [4, 28.7, 15.87],
      [4, 35.9, 16.51], [5, 37.6, 21.14], [4, 0.7, 12.49], [3, 47.5, 24.11]],
    lines: [[0, 1, 2, 3, 4, 5, 6], [3, 7]],
  },
  Gemini: {
    stars: [[7, 34.6, 31.89], [7, 45.3, 28.03], [7, 11.1, 30.25], [6, 43.9, 25.13], [6, 22.9, 22.51],
      [6, 14.9, 22.51], [7, 20.1, 21.98], [7, 4.1, 20.57], [6, 37.7, 16.40], [7, 18.1, 16.54], [6, 45.3, 12.90]],
    lines: [[0, 1], [0, 2, 3, 4, 5], [1, 6, 7, 8], [6, 9, 10]],
  },
  Cancer: {
    stars: [[8, 16.5, 9.19], [8, 44.7, 18.15], [8, 58.5, 11.86], [8, 43.3, 21.47], [8, 46.7, 28.76]],
    lines: [[0, 1, 2], [1, 3, 4]],
  },
  Leo: {
    stars: [[10, 8.4, 11.97], [10, 7.3, 16.76], [10, 20.0, 19.84], [10, 16.7, 23.42], [9, 52.8, 26.01],
      [9, 45.9, 23.77], [11, 14.1, 20.52], [11, 49.1, 14.57], [11, 14.2, 15.43]],
    lines: [[0, 1, 2, 3, 4, 5], [2, 6, 7, 8, 0]],
  },
  Virgo: {
    stars: [[11, 50.7, 1.76], [12, 19.9, -0.67], [12, 41.7, -1.45], [12, 55.6, 3.40], [13, 2.2, 10.96],
      [13, 25.2, -11.16], [13, 34.7, -0.60], [14, 46.3, 1.89], [14, 16.0, -6.0]],
    lines: [[0, 1, 2, 3, 4], [2, 5], [3, 6, 7], [6, 8]],
  },
  Libra: {
    stars: [[15, 4.1, -25.28], [14, 50.9, -16.04], [15, 17.0, -9.38], [15, 35.5, -14.79], [15, 37.0, -28.14], [15, 38.7, -29.78]],
    lines: [[0, 1, 2, 3, 4, 5], [1, 3]],
  },
  Scorpio: {
    stars: [[16, 5.4, -19.81], [16, 0.3, -22.62], [15, 58.9, -26.11], [16, 21.2, -25.59], [16, 29.4, -26.43],
      [16, 35.9, -28.22], [16, 50.2, -34.29], [16, 51.9, -38.05], [16, 54.6, -42.36], [17, 12.2, -43.24],
      [17, 37.3, -43.00], [17, 47.6, -40.13], [17, 42.5, -39.03], [17, 33.6, -37.10], [17, 30.8, -37.30]],
    lines: [[0, 1, 2], [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
  },
  Sagittarius: {
    stars: [[18, 5.8, -30.42], [18, 21.0, -29.83], [18, 28.0, -25.42], [18, 45.7, -26.99], [18, 55.3, -26.30],
      [19, 6.9, -27.67], [19, 2.6, -29.88], [18, 24.2, -34.38]],
    lines: [[0, 1, 2, 3, 4, 5, 6, 7, 0], [1, 7], [1, 3, 6]],
  },
  Capricorn: {
    stars: [[20, 18.1, -12.54], [20, 21.0, -14.78], [20, 46.1, -25.27], [20, 51.8, -26.92], [21, 26.7, -22.41],
      [21, 47.0, -16.13], [21, 40.1, -16.66], [21, 22.2, -16.83], [21, 5.9, -17.23]],
    lines: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 1]],
  },
  Aquarius: {
    stars: [[20, 47.7, -9.50], [21, 31.6, -5.57], [22, 5.8, -0.32], [22, 21.7, -1.39], [22, 28.8, -0.02],
      [22, 35.4, -0.12], [22, 25.3, 1.38], [22, 16.8, -7.78], [22, 52.6, -7.58], [22, 49.6, -13.59], [22, 54.7, -15.82]],
    lines: [[0, 1, 2, 3, 4, 5], [4, 6], [2, 7, 8, 9, 10]],
  },
  Pisces: {
    stars: [[23, 17.2, 3.28], [23, 27.0, 1.26], [23, 42.0, 1.78], [23, 40.0, 5.63], [23, 28.0, 6.38],
      [23, 59.3, 6.86], [0, 48.7, 7.59], [1, 2.9, 7.89], [1, 13.7, 7.58], [1, 41.4, 5.49], [2, 2.0, 2.76],
      [1, 45.4, 9.16], [1, 31.5, 15.35], [1, 13.7, 24.58], [1, 19.5, 27.26], [1, 11.7, 30.09]],
    lines: [[0, 1, 2, 3, 4, 0], [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
  },
};

// Turn sky positions into flat x, y points that fit a box.
// East is on the left in a sky map, so x runs the other way to right ascension.
function project(stars, width, height, pad) {
  let ras = stars.map(([h, m]) => (h + m / 60) * 15);
  // Pisces crosses 0h: keep all its stars on the same side of the circle.
  if (Math.max(...ras) - Math.min(...ras) > 180) ras = ras.map((ra) => (ra > 180 ? ra - 360 : ra));
  const decs = stars.map((s) => s[2]);
  const mid = ((Math.max(...decs) + Math.min(...decs)) / 2) * (Math.PI / 180);
  const xs = ras.map((ra) => -ra * Math.cos(mid));
  const ys = decs.map((d) => -d);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const w = Math.max(...xs) - minX || 1, h = Math.max(...ys) - minY || 1;
  const scale = Math.min((width - 2 * pad) / w, (height - 2 * pad) / h);
  // Line the drawing up on the left (like the text), centred top to bottom.
  const offX = pad, offY = (height - h * scale) / 2;
  return xs.map((x, i) => [offX + (x - minX) * scale, offY + (ys[i] - minY) * scale]);
}

function el(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Draw one sign's constellation. It starts hidden; call play() to draw it.
export function drawConstellation(sign, { width = 200, height = 120 } = {}) {
  const data = CONSTELLATIONS[sign];
  if (!data) return null;
  const pts = project(data.stars, width, height, 8);

  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, class: 'constellation-drawing', role: 'img' });
  svg.setAttribute('aria-label', `The stars of ${sign}`);

  // Every line, split into single steps from one star to the next,
  // in the order they should be drawn.
  const steps = [];
  for (const line of data.lines) {
    for (let i = 1; i < line.length; i++) steps.push([line[i - 1], line[i]]);
  }
  const stepTime = Math.min(260, 2200 / steps.length); // whole drawing takes about 2 seconds
  const starTime = new Map([[data.lines[0][0], 0]]);    // when each star lights up

  steps.forEach(([a, b], n) => {
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const seg = el('line', { x1, y1, x2, y2, class: 'c-line' });
    // A dashed line with one dash as long as the line, pushed out of
    // view; the animation slides it back in, so the line seems to draw.
    seg.style.strokeDasharray = length;
    seg.style.strokeDashoffset = length;
    seg.style.animationDelay = `${n * stepTime}ms`;
    seg.style.animationDuration = `${stepTime}ms`;
    svg.append(seg);
    if (!starTime.has(a)) starTime.set(a, n * stepTime);
    if (!starTime.has(b)) starTime.set(b, (n + 1) * stepTime);
  });

  pts.forEach(([x, y], i) => {
    const star = el('circle', { cx: x, cy: y, r: 2.4, class: 'c-star' });
    star.style.animationDelay = `${starTime.get(i) ?? 0}ms`;
    svg.append(star);
  });

  // Adding the class "drawn" starts all the animations (see css/universe.css).
  const play = () => svg.classList.add('drawn');
  return { svg, play };
}
