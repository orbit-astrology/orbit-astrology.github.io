# ORBIT

An interactive personal astrology atlas: a website where you enter your birth details, see your real birth chart, and learn what each part of it means.

Individual Web Project · Webs & Apps Design · 2026

**Status:** stage 6. Every page works with real charts: Welcome, My Universe, My Chart, Explore, Connections and Profile. Everything is saved in the browser for now; real accounts are a possible later stage. The developer test page is at `/development/lab/`.

## How the project folder is organised

Structure, style and interaction are kept in separate files, and images have their own folder:

```
ORBIT/                    (the final project folder)
├── index.html            ← STRUCTURE (HTML): one file per page
├── universe.html            index.html is the Welcome page and must
├── chart.html               stay at the top so the website opens
├── explore.html
├── connections.html
├── profile.html
├── css/                  ← STYLE (CSS): colours and fonts (tokens.css),
│                            shared styles (base.css), one file per page
├── js/                   ← INTERACTION (JavaScript)
│   ├── pages/               one file per page (what happens when you click)
│   ├── astro/               the chart calculation
│   ├── content/             the explanation texts
│   └── vendor/              Astronomy Engine (the library that finds the planets)
├── img/                  ← IMAGES: the ORBIT icon, linked from every HTML page
├── development/          ← behind the scenes (not part of the website itself)
│   ├── docs/                build log, style guide, writing guide
│   ├── tests/               accuracy checks against published charts
│   ├── tools/               the version-number helper
│   └── lab/                 the calculation test page
└── README.md             ← this file
```

How the files connect: each HTML page links its CSS files in the `<head>` (`<link rel="stylesheet" href="css/base.css">`), its JavaScript file at the end (`<script type="module" src="js/pages/chart.js">`), and its icon from `img/`. No HTML page contains styles or scripts written inside it.

## Pages

| Page | File | Status |
| --- | --- | --- |
| Welcome (birth form) | `index.html` | Working |
| My Universe | `universe.html` | Working |
| My Chart | `chart.html` | Working |
| Explore | `explore.html` | Working |
| Connections | `connections.html` | Working |
| Profile | `profile.html` | Working |

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
| `js/birth-form.js` | The birth form (place search, checks, the "time happened twice" question), shared by Welcome and Connections |
| `js/tour.js` | “Watch your chart build”: the step-by-step tour of the wheel on My Chart |
| `js/time-travel.js` | “Travel through time”: the real sky on any day over your chart (My Universe) |
| `js/cloud.js` | Accounts: sign up, log in, and syncing your data with Supabase (database setup: `development/docs/supabase-setup.sql`) |
| `js/account-panel.js` | The “Your account” box on Profile |
| `js/save-button.js` | The “Save to my profile” button on My Chart readings and Explore topics |
| `js/share.js` | “Share my chart” links: your birth details in the part of the address after #, which never reaches the server |
| `js/compare.js` | Compares two people's charts: the angles between their personal planets, explained in plain words |
| `js/vendor/astronomy.js` | Astronomy Engine by Don Cross (MIT license), which calculates where the planets are |
| `development/lab/` | The test page |
| `development/tests/` | Published reference charts and the checks that compare ORBIT against them |

## Checking accuracy

Open the lab and press **Run the reference checks**, or in a terminal:

```
node development/tests/run-tests.js
```

ORBIT is compared with published charts (Astrotheme, Astro-Charts) for four people born in different countries and decades, one moment of the current sky, and tricky time-zone cases. Planets, angles and house cusps all agree to within about 1 arcminute (1/60 of a degree).

## Settings

Tropical zodiac · Placidus houses · Sun to Pluto · major aspects with orbs of 8° (conjunction, opposition), 7° (square, trine) and 5° (sextile). When comparing two people, tighter orbs: 6°, 5° and 4°. Supported dates: 1900–2100.

## Credits

- Planet positions: [Astronomy Engine](https://github.com/cosinekitty/astronomy), MIT license (see `js/vendor/astronomy-LICENSE.txt`)
- Birthplace search: [Open-Meteo Geocoding API](https://open-meteo.com/), free for non-commercial use
- Reference charts: [Astrotheme](https://www.astrotheme.com), [Astro-Charts](https://www.astro-charts.com)
- Built with help from Claude (AI); see `development/docs/build-log.md` for what AI did and what I decided
