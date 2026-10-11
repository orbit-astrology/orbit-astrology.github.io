# ORBIT build log

One entry per work session: what was done, what was decided, what went wrong, and who did what. This becomes the base of the Process & Design Document.

---

## 11 October 2026 · Planning and calculation test

**What we did**
- Wrote the planning report (submitted version + detailed version).
- Created the GitHub repository.
- Built and tested the calculation: birth details → real chart, with a plain test page (the "calculation lab").

**Decisions**
- **Engine changed from Swiss Ephemeris to Astronomy Engine.** The plan said Swiss Ephemeris first, Astronomy Engine as backup. Swiss Ephemeris has no ready-made browser version; it has to be compiled with extra tools, which adds a build step I'd need to explain. Astronomy Engine is one ready-made JavaScript file, MIT-licensed (no open-source requirement), and accurate to within 1 arcminute. The trade-off: it doesn't do houses, so the Ascendant, Midheaven and Placidus houses are calculated in our own code (`houses.js`), which is also something I can explain in the presentation.
- **No Luxon.** The browser's built-in `Intl.DateTimeFormat` already knows every place's historical clock rules, so `time.js` uses that instead of an extra library.
- **Unknown birth time:** the planets are shown at local noon, but the whole day is checked. Anything that changes sign during the day is marked uncertain (e.g. "Moon in Virgo or Libra"). No Ascendant or houses are shown.
- **Near the polar circles**, Placidus houses can't be calculated; ORBIT says so instead of switching to another house system.

**Testing**
- 79 automatic checks, all passing: four published charts (USA 1961, Spain 1986, Germany 1987, Australia 1968), one sky snapshot from 2026, and time-zone traps (clocks going forward and back, half-hour time zones, the date changing in UTC).
- Largest difference from the published charts: about 1.2 arcminutes.
- Tested the lab page on desktop and phone sizes; no horizontal scrolling.

**Problems**
- The test reference sites cut off minutes instead of rounding, so the checks compare against the middle of each minute.
- Astro.com blocks automated reading, so references came from Astrotheme and Astro-Charts instead. ✋ To do: check one chart by hand on Astro.com.

**AI vs me**
- Me: the concept, all creative direction, approving the plan and the choice of engine, deciding to keep the repo public.
- Claude: researched engines, wrote the calculation code and tests, built the lab page, explained each file.

**Next**
- Me: check one chart on Astro.com against the lab; try fonts and colors in Figma; moodboard for the report.
- Together: wireframes, then the real site shell and the Welcome page.

---

## 11 October 2026 (evening) · Layout and colour

**What we did**
- Sketched 3 layout options for the results page (A: editorial scroll, B: chart in the centre with tabs, C: step by step).
- Sketched every page: Welcome, My Universe, My Chart, Explore, Connections, Profile.
- Explored colour in five rounds, then chose one.

**My decisions**
- Layout A for My Universe: I liked it best; B and C hid too much behind clicks. I asked for it to be less boxy and to fill the screen like a real website (version A2).
- Results go on a separate page after the form, with tabs at the top (My Universe · My Chart · Explore · Connections · Profile).
- My Chart (the carta astral): hover over anything to see what it is, with detailed explanations underneath the wheel. This comes from my own frustration: chart sites never explain what you're looking at, and asking another AI gives generic answers.
- Keep the "Explore a sample chart" button, with a made-up person, not celebrities.
- **Everything must be explained for beginners** (now `docs/writing-guide.md`).
- Constellation drawings in the outer ring of the chart wheel (from my references).
- Colour, round by round:
  1. First colour version: too much contrast, with a black Welcome page and big bright topic bands.
  2. Light version: too pale and "nice".
  3. Deep version, all colours the same depth: closer, but I didn't like the brown and the colours were too vibrant.
  4. **Dusty version, no brown: chosen** (`docs/style-guide.md`).
  5. Six very different hues: I preferred version 4.

**AI vs me**
- Me: chose the layout, the colour references (Pinterest palettes), every colour decision and change, the beginner-first rule, the constellation idea.
- Claude: drew the sketches and colour options from my feedback, checked text readability for each colour, wrote the style and writing guides.

**Next**
- Build the real site, starting with the Welcome page and My Universe.
