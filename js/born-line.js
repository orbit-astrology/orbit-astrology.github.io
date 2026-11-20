// born-line.js
// ---------------------------------------------------------------
// The birth details, shown big at the top of My Universe and My Chart:
//
//   BORN
//   9 September 2006          ← the date, a little bigger than normal text
//   08:53 · Lima, Peru        ← time and place, smaller
//
// Both pages use this same function, so they always look the same.
// ---------------------------------------------------------------

import { marginText } from './readings.js?v=202611201854';

export function bornLine(birth) {
  const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(birth.year, birth.month - 1, birth.day)));
  const clock = `${String(birth.hour).padStart(2, '0')}:${String(birth.minute).padStart(2, '0')}`;
  const time = !birth.timeKnown ? 'Time unknown'
    : birth.margin ? `Around ${clock} (${marginText(birth.margin)})` : clock;

  const box = document.createElement('p');
  box.className = 'born';

  const label = document.createElement('span');
  label.className = 'born-label';
  label.textContent = birth.isSample ? `${birth.name} was born` : 'Born';

  const day = document.createElement('span');
  day.className = 'born-date';
  day.textContent = date;

  const rest = document.createElement('span');
  rest.className = 'born-rest';
  rest.textContent = `${time} · ${birth.place.label}`;

  box.append(label, day, rest);
  return box;
}
