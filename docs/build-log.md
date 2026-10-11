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
