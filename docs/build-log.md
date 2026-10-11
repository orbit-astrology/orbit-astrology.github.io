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

---

## 11 October 2026 (night) · Stage 2: Welcome and My Universe

**What we built**
- **Shared styles** from my style guide (`css/tokens.css`, `css/base.css`): page colours, fonts, menu (folds into a "Menu" button on phones), buttons, form fields.
- **Welcome page** (`index.html`): the birth form with day/month/year, hour/minute, "I don't know my birth time", and a birthplace search that suggests real places (Valencia, Spain vs Valencia, Venezuela). Clear error messages, a question when a time happened twice (clocks going back), and "Explore a sample chart" with a made-up person (Alex).
- The faint wheel behind the title is **the real sky right now**, with a caption saying where the Sun and Moon are today.
- **My Universe** (`universe.html`): your real chart wheel (drawn from the calculation, with constellation drawings), your Big Three with a short plain explanation each, **Your sky this week** with real events (planets changing sign, turning retrograde, or making angles to your Sun, Moon and Rising), and links to Explore.
- **Hover/tap explanations** for astrology words (`js/glossary.js`): every dotted-underlined word explains itself.
- Placeholder pages for My Chart, Explore, Connections and Profile, so the menu never leads to a broken link.
- Details are saved **only in this browser** for now (no accounts yet), and the page says so.

**Honesty checks**
- No birth time → Rising shows "Unknown" with an explanation; if the Moon changed sign that day it shows both ("Virgo or Libra").
- The sample chart is always labelled as a made-up person.

**Testing**
- Full flow in a real browser: empty form, missing place, normal birth, unknown time, the "happened twice" time, sample chart, phone size (no sideways scrolling), phone menu, glossary pop-ups. No errors.
- Calculation checks still pass (79/79).
- Fixed during testing: a hidden question was showing on the Welcome page; the page was too wide on phones; weekly text read awkwardly ("Sun supports your Sun" → "The Sun supports your Sun").

**AI vs me**
- Me: the layout, colours, pages and rules this is built from; the beginner-first explanations; the sample chart idea.
- Claude: wrote the code and first drafts of all explanation texts (`js/content/`), which **I still need to read and edit**.

**My feedback after trying it (and the fixes)**
- "I love it!" but some lettering was hard to read → heavier font weights for titles, labels, menu and body text (Bodoni's thin strokes disappeared at small sizes).
- On the Welcome page the text overlapped the wheel → the wheel now fades out towards the left, so the words sit on a clean background.
- In "Explore yourself" it wasn't clear you could click → added an underlined "Explore →" link and a hover effect to each topic; "Change birth details" is now a button.

**To do (me)**
- Read `js/content/basics.js` and `js/content/glossary.js` and change anything that doesn't sound right.
- Try the site with my own birth details and compare with Astro.com.

---

## 11 October 2026 (late) · Stage 3: My Chart (the carta astral)

**What we built** (`chart.html`, `js/pages/chart.js`, `js/readings.js`)
- The big constellation wheel, drawn from my real chart. **Hover over anything** to see what it means for me: a planet (sign, degree, house and one line), a sign (what it means and which of my planets are in it), a house (which area of life, which planets), or ASC/MC.
- Hovering a planet **lights up its lines** (aspects) and fades the rest, so you can see what it's connected to.
- **Click a planet** (or press Enter on it with the keyboard) to jump to its full explanation. On a phone: first tap shows the box, second tap jumps.
- **Wheel view / List view** switch: the list is a plain table for people who find the wheel hard to read.
- **"How to read the wheel"** next to it (signs = how, planets = what, houses = where, lines = aspects; dashed = easy, solid = tense).
- **"Your chart, explained"**: one section per placement (Sun, Moon, Rising, Mercury … Pluto, Midheaven), each with:
  - the grammar sentence: *Your Venus (how you love) in Cancer (tenderly and protectively) in your 8th house (deep bonds…)*
  - a paragraph built from the planet, the sign and the house
  - "How it connects to the rest of your chart": its aspects in plain words
  - **"How we know this"**: the steps from my birth time to that exact degree
- Honest extras: slow planets (Uranus, Neptune, Pluto) say that everyone my age shares their sign; retrograde planets are explained.
- No birth time: no houses, Rising or Midheaven on the wheel or in the list, with a note explaining why; a Moon that changed sign that day shows both options.

**Decisions**
- The explanations stay on the page's own slate colour (a slightly darker band) instead of a cream "paper" section, to avoid the big colour jump I didn't like.
- Readings are built from parts (planet + sign + house + aspects), so every chart gets its own text without writing 120+ separate articles.

**Testing**
- Mouse hover on planets, signs and houses; keyboard (Tab to a planet, Enter jumps to its section); phone taps; List view; a chart with no birth time; phone width. 79/79 calculation checks still pass.
- Fixed: Enter key didn't work on planets (SVG shapes don't have `.click()`); the first tap on a phone jumped down instead of showing the box; "are at side by side" → "are side by side".

**AI vs me**
- Me: the idea of hovering for info with detailed explanations underneath (from my own frustration with chart sites), the beginner-first rule, the colours.
- Claude: wrote the code and the draft texts (`js/content/basics.js`, `js/readings.js`) for me to review.
