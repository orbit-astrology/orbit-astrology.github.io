// time-travel.js
// ---------------------------------------------------------------
// "Travel through time" (My Universe).
//
// A wheel with your birth chart (gold) and the real sky on any day
// you choose (lilac, on the inner ring). Move the slider, press the
// day buttons, or press Play to watch the planets travel.
//
// When a planet in the sky that day makes a close angle (within 1.5°)
// to one of your planets, a line joins them and the list explains it.
// Astrologers call these "transits". Everything is calculated live
// with the same code as your birth chart (js/astro/sky.js).
// ---------------------------------------------------------------

import { skyAt } from './astro/sky.js?v=202610201505';
import { findCrossAspects } from './astro/aspects.js?v=202610201505';
import { drawWheel } from './wheel.js?v=202610201505';
import { PLANETS, ASPECT_TEXT } from './content/basics.js?v=202610201505';

const DAY = 86400000;
const CLOSE = 1.5; // degrees: how close an angle must be to count
const nameOf = (id) => id[0].toUpperCase() + id.slice(1);

// What each planet in the sky stands for (it's everyone's sky, so no "your").
const SKY_THEME = {
  sun: 'identity and energy', moon: 'moods and feelings', mercury: 'thinking and talking',
  venus: 'love and pleasure', mars: 'drive and action', jupiter: 'growth and luck',
  saturn: 'effort and limits', uranus: 'change and surprises', neptune: 'dreams and intuition',
  pluto: 'deep change',
};
// A short verb for each kind of angle, for the titles: "Mars flows with your Venus".
const VERB = { conjunction: 'meets', sextile: 'supports', square: 'challenges', trine: 'flows with', opposition: 'faces' };
const dateFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// Your points the sky can touch: your planets, plus your Rising sign
// when the birth time is exact.
function yourPoints(chart) {
  const points = chart.bodies.filter((b) => !b.uncertain);
  if (chart.angles && !chart.timeMargin && !chart.angles.ascendant.uncertain) {
    points.push({ id: 'rising', longitude: chart.angles.ascendant.longitude });
  }
  return points;
}

export function setUpTimeTravel({ chart, wheelBox, slider, dateLabel, list, buttons }) {
  // "Day 0" is today at midday, in your own time zone.
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  let timer = null;

  function show(offsetDays) {
    const date = new Date(today.getTime() + offsetDays * DAY);
    const sky = skyAt(date);

    // Close angles between the sky that day and your chart.
    const links = findCrossAspects(yourPoints(chart), sky.bodies)
      .filter((l) => l.orb <= CLOSE && l.from !== 'rising');
    const risingLinks = findCrossAspects(yourPoints(chart).filter((p) => p.id === 'rising'), sky.bodies)
      .filter((l) => l.orb <= CLOSE);

    // The wheel: your chart outside, that day's sky inside, lines between.
    wheelBox.replaceChildren(drawWheel(chart, {
      aspects: false,
      partner: { chart: sky, aspects: links },
      label: `Your birth chart with the sky on ${dateFormat.format(date)}: ${links.length + risingLinks.length} close angles to your planets.`,
    }));

    // The date, and how far it is from today.
    const when = offsetDays === 0 ? 'Today'
      : offsetDays === 1 ? 'Tomorrow'
        : offsetDays === -1 ? 'Yesterday'
          : offsetDays > 0 ? `In ${offsetDays} days` : `${-offsetDays} days ago`;
    dateLabel.replaceChildren(dateFormat.format(date), Object.assign(document.createElement('span'), { textContent: when }));
    slider.value = String(offsetDays);
    slider.setAttribute('aria-valuetext', `${dateFormat.format(date)} (${when.toLowerCase()})`);

    // The explanations.
    list.replaceChildren();
    const all = [...links, ...risingLinks].sort((a, b) => a.orb - b.orb);
    if (!all.length) {
      const li = document.createElement('li');
      li.className = 'quiet';
      li.textContent = 'Nothing lines up closely with your planets on this day. Try moving the slider: the faster planets (the Moon, Mercury, Venus) bring something new almost every day.';
      list.append(li);
    }
    for (const l of all) {
      const t = ASPECT_TEXT[l.type];
      const yours = l.from === 'rising' ? 'your Rising sign (how you come across)' : `your ${nameOf(l.from)} (${PLANETS[l.from].what})`;
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${nameOf(l.to)} ${VERB[l.type]} ${l.from === 'rising' ? 'your Rising sign' : `your ${nameOf(l.from)}`}`;
      li.append(strong, `${nameOf(l.to)} in the sky that day (${SKY_THEME[l.to]}) and ${yours} are ${t.plain} (${t.angle}°): ${t.meaning}.`);
      list.append(li);
    }
  }

  const go = (offset) => show(Math.max(Number(slider.min), Math.min(Number(slider.max), offset)));
  const current = () => Number(slider.value);

  function stop() {
    clearInterval(timer);
    timer = null;
    buttons.play.textContent = 'Play';
    buttons.play.setAttribute('aria-pressed', 'false');
  }
  function play() {
    if (timer) return stop();
    buttons.play.textContent = 'Pause';
    buttons.play.setAttribute('aria-pressed', 'true');
    // One day every 0.15 seconds; stops at the end of the slider.
    timer = setInterval(() => {
      if (current() >= Number(slider.max)) return stop();
      go(current() + 1);
    }, 150);
  }

  slider.addEventListener('input', () => { stop(); show(current()); });
  buttons.back.addEventListener('click', () => { stop(); go(current() - 1); });
  buttons.forward.addEventListener('click', () => { stop(); go(current() + 1); });
  buttons.today.addEventListener('click', () => { stop(); go(0); });
  buttons.play.addEventListener('click', play);

  show(0);
}
