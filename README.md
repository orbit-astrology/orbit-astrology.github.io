# ORBIT

An interactive personal astrology atlas: a website where you enter your birth details, see your real birth chart, and learn what each part of it means.

Individual Web Project · Webs & Apps Design · 2026

**Status:** stage 2. The Welcome page and My Universe work with real charts. My Chart, Explore, Connections and Profile are coming next. The developer test page is at `/lab/`.

## Pages

| Page | File | Status |
| --- | --- | --- |
| Welcome (birth form) | `index.html` | Working |
| My Universe | `universe.html` | Working |
| My Chart | `chart.html` | Coming next |
| Explore | `explore.html` | Coming soon |
| Connections | `connections.html` | Coming soon |
| Profile | `profile.html` | Coming soon |

## How it works so far

```
birth form → birthplace search → exact UTC moment → planet positions
           (Open-Meteo)        (time.js)           (chart.js + Astronomy Engine)
                                                 → houses & angles (houses.js)
                                                 → aspects (aspects.js)
```

| File | What it does |
| --- | --- |
| `js/astro/settings.js` | Every astrological choice in one place: zodiac, house system, the ten planets, aspect angles and orbs |
| `js/astro/places.js` | Searches birthplaces and returns coordinates and the place's time zone |
| `js/astro/time.js` | Converts the local birth time to UTC using that place's historical clock rules |
| `js/astro/chart.js` | Turns birth details into one chart object that the whole site will use |
| `js/astro/houses.js` | Ascendant, Midheaven and the 12 Placidus house cusps |
| `js/astro/aspects.js` | Finds the angles between planets (conjunction, sextile, square, trine, opposition) |
| `js/astro/zodiac.js` | Small helpers: which sign a degree is in, and how to write it (12°33′ Leo) |
| `js/vendor/astronomy.js` | Astronomy Engine by Don Cross (MIT license), which calculates where the planets are |
| `lab/` | The test page |
| `tests/` | Published reference charts and the checks that compare ORBIT against them |

## Checking accuracy

Open the lab and press **Run the reference checks**, or in a terminal:

```
node tests/run-tests.js
```

ORBIT is compared with published charts (Astrotheme, Astro-Charts) for four people born in different countries and decades, one moment of the current sky, and tricky time-zone cases. Planets, angles and house cusps all agree to within about 1 arcminute (1/60 of a degree).

## Settings

Tropical zodiac · Placidus houses · Sun to Pluto · major aspects with orbs of 8° (conjunction, opposition), 7° (square, trine) and 5° (sextile). Supported dates: 1900–2100.

## Credits

- Planet positions: [Astronomy Engine](https://github.com/cosinekitty/astronomy), MIT license (see `js/vendor/astronomy-LICENSE.txt`)
- Birthplace search: [Open-Meteo Geocoding API](https://open-meteo.com/), free for non-commercial use
- Reference charts: [Astrotheme](https://www.astrotheme.com), [Astro-Charts](https://www.astro-charts.com)
- Built with help from Claude (AI); see `docs/build-log.md` for what AI did and what I decided
