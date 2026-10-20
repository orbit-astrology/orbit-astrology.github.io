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

**Problem found when I tried it live:** My Chart showed no wheel and no explanations. The live files were correct; my browser was still using an old saved copy of one file from earlier, so the new page asked it for something it didn't have and stopped. A hard refresh fixes it, but it would happen after every update (also to my teacher). **Fix:** every link to our own CSS/JS now carries a version number (`chart.js?v=202610111755`), set by `tools/set-version.js` before each update, so browsers always fetch the new files.

**AI vs me**
- Me: the idea of hovering for info with detailed explanations underneath (from my own frustration with chart sites), the beginner-first rule, the colours.
- Claude: wrote the code and the draft texts (`js/content/basics.js`, `js/readings.js`) for me to review.

---

## 11 October 2026 (late) · Stage 4: Explore

**What we built** (`explore.html`, `js/pages/explore.js`, `js/content/topics.js`, `js/playground.js`)
- **Five topics**, each answering a real question with *my* placements:
  - 01 Identity & personality · *Who am I?* (Sun, Rising, Mercury)
  - 02 Emotions & inner world · *What do I need to feel safe?* (Moon, 4th house, what affects my mood)
  - 03 Love & relationships · *How do I love?* (Venus, Mars, 7th and 5th houses, how my love planets connect)
  - 04 Career & direction · *Where am I going?* (Midheaven, Saturn, 10th and 6th houses)
  - 05 Growth & change · *What am I learning?* (Jupiter, Saturn, Pluto, my tense angles)
- Each part has a sentence written for that topic (Venus means something specific in Love), where it sits in my life (house), and a link to the full explanation in My Chart.
- Houses with no planets say so honestly ("very common and doesn't mean this area is empty in your life").
- **The astrology library**: planets, signs, houses and aspects explained for beginners, no chart needed. If you have a chart, each item also shows yours ("Yours: Cancer, 8th house").
- **The aspect playground**: drag the Moon around the Sun (or use the arrow keys). The angle updates live; at 0°, 60°, 90°, 120° or 180° a line appears and explains the aspect, including what the "orb" is.
- Topics open at addresses like `explore.html#love`, so the Back button works and My Universe links straight to them.
- Topic colours appear only as small dots, as I asked (no big bands).

**Testing**
- All five topics with a full chart; Love with no birth time (houses hidden, with a note); no chart at all (library and playground still work, topics invite you to create a chart); playground by keyboard and by dragging; phone width. No errors; 79/79 calculation checks pass.
- Fixed: "fun feels best when they're gently and imaginatively" (grammar), and a grey line that repeated the main sentence (now it says which area of life instead).

**AI vs me**
- Me: the five topics and their questions (from the plan, inspired by The Pattern), the aspect playground idea, small coloured dots instead of bands.
- Claude: wrote the code and the draft topic texts for me to review.

---

## 11 October 2026 (night) · Proportions

**My feedback:** "everything is too big": titles broke onto two lines and sections didn't fit on the screen. I wanted the same proportions everywhere, titles on one line where possible, and each part fully visible on the screen.

**What changed**
- Scaled the whole type system down by the same proportion: page titles about half the size (one line), section titles, sign names, topic names and readings all smaller; body text 17 → 16 px.
- Less empty space between sections (roughly a third less padding).
- The chart wheels are now sized by the **screen height**, so the whole wheel fits on screen (My Universe, My Chart, and the playground).
- The Big Three still step down diagonally, but more gently.
- Fixed two bugs I spotted in my screenshots: a huge empty gap under "Who am I?" on topic pages (two different elements shared a style name), and "birth chart" not matching the spaced capitals in "YOUR BIRTH CHART".

**Testing:** screenshots of every page at a laptop size (1440 × 900): all titles fit on one line. Phone, keyboard and touch tests still pass; 79/79 calculation checks.

---

## 11 October 2026 (night) · Stage 5: Connections

**What we built** (`connections.html`, `js/pages/connections.js`, `js/compare.js`, `js/content/connections.js`)
- **Your people**: a list of the people you've added, each with their Sun, Moon and Rising, a Compare button and Remove (which asks "are you sure?" right in the list, no pop-up).
- **Add a person**: name, birth date, time (or "I don't know their birth time") and birthplace, plus a box to tick confirming **they're happy for you to use their birth details**. Their details are saved only in this browser.
- **Try it with a sample person**: "Sam", a made-up person, clearly labelled, so anyone can see how it works without typing someone else's details.
- **You & Sam**: both charts on one wheel. You on the outer ring in gold, them on the inner ring in lilac, and lines between your planets and theirs (dashed = easy, solid = tense, same as My Chart). Hover or tap a planet to see its links; hover a link in the list to see it on the wheel.
- **Side by side**: a small table with each planet's sign for both people.
- **How your charts talk to each other**: every link explained in plain words: your planet (what part of you), their planet (what part of them), the angle, what this pair is about and how it tends to feel. "Strong link" (almost exact angle) is explained with a hover.
- **Friendship / Romance switch**: changes only the *words* (for example Venus with Mars is "a playful, energising pull" for friends and "attraction: how affection and desire meet" for a couple). The planets and angles never change.
- **No scores or percentages.** The summary only counts the links ("3 easy, 2 tense and 2 blending") and says a mix is normal and tense links aren't bad.
- No birth time for either person: the Moon could be a few degrees off, so each link is checked at the very start and the very end of that day. If it doesn't hold all day it says **"Might not be exact"**. No Rising sign is invented.
- You need your own chart first; without one the page explains that and links to the form.

**Decisions**
- We only compare the five **personal planets** (Sun, Moon, Mercury, Venus, Mars). They describe everyday personality, feelings, talking, love and energy, and comparing all ten planets would make dozens of links and overwhelm a beginner.
- Tighter orbs for comparing two people (6°/5°/4°), as most astrologers use.
- The birth form now lives in one shared file (`js/birth-form.js` and `css/birth-form.css`), so Welcome and Connections work exactly the same way and a fix in one place fixes both.

**Testing**
- Empty state, sample person, adding a person (every check: no name, permission not ticked, missing date), unknown birth time, Back button, remove with cancel and confirm, both lenses, hovering planets and links, phone width (375 px, no sideways scrolling) and tapping on a touch screen. No errors.
- A name typed with HTML in it shows as plain text, so it can't break the page.
- The Welcome page tests still pass after moving the form into its own file; 79/79 calculation checks pass.

**AI vs me**
- Me: the Connections idea, the Friendship / Romance switch, no compatibility scores, asking for permission, a made-up sample instead of real people, keeping the same editorial style in mauve.
- Claude: wrote the code, picked the five personal planets and the orbs, and drafted the pair texts for me to review (`js/content/connections.js`).

---

## 11 October 2026 (night) · Connections: hover everything on the wheel

**My feedback:** on "You & Juan Pablo" I wanted to be able to hover over the wheel and read it, not only the list underneath.

**What changed**
- **Lines** between your planets and theirs can now be hovered (or tapped on a phone): a box says which two planets, whether the link is easy or tense, and what it's about (following the Friendship / Romance switch). Clicking jumps to the full explanation in the list. Each line has a wider invisible copy so it's easy to hit.
- **Signs** can be hovered or tapped too: what the sign means and whose planets are in it ("Sam's: Sun, Mercury, Venus").
- **Planets** already worked; they still show their links.
- A small hint sits **above** the wheel, "Hover or tap a planet, a line or a sign to read about it", so it's noticed straight away (before, it was at the bottom of the side column).
- Fixed: on phones, tapping a sign opened and closed the box in the same tap. Now one tap opens it and a second tap closes it.

**Testing:** hovering lines, signs and planets on a laptop; tapping on a phone (375 px); keyboard (Tab reaches the lines, Enter jumps to the explanation). No errors; 79/79 calculation checks.

**AI vs me:** Me: the idea of reading the wheel by hovering. Claude: the code and the box texts.

---

## 11 October 2026 (night) · Connections: making the Friendship / Romance switch visible

**My feedback:** "when I click either Friendship or Romance nothing changes, no?"

**What was happening:** it did work, but it only changes the wording of the explanations, which are further down the page, so from the top nothing seemed to happen.

**What changed**
- Under the switch: "The planets stay the same; the explanations change." plus a link, **See the explanations ↓**.
- A second Friendship / Romance switch right above the explanations ("Read these as"), so you can compare the two readings while looking at them. Both switches always match.
- When you switch, the explanations glow for a moment to show they've changed (no glow for people who turn off animations on their device).

**AI vs me:** Me: spotted that the switch looked like it did nothing. Claude: the fix.

---

## 11 October 2026 (night) · Connections: share links

**My idea:** add friends by their username if they're also on ORBIT, so it becomes a friendship.

**What we decided:** usernames need real accounts, which means a server and a database to store everyone's details safely, with logins and privacy settings. That's a big step for later. For now we built a **"share my chart" link**, which gives most of the same experience without accounts.

**How it works**
- On Connections, under your people: **Share your chart**. Type your name, press *Create my link*, then *Copy* and send it to a friend.
- When your friend opens the link, ORBIT shows "Juan Pablo shared their chart with you", their birth details and Big Three, and asks: **Add Juan Pablo to my people** or *No thanks*. Nothing is saved until they say yes.
- People added this way are labelled "Shared with you". They don't need to tick the permission box, because sharing the link *is* the permission.
- If your friend has no chart yet, they're saved and the page asks them to create their own chart so they can compare.
- Opening your own link says "This is your own link". Opening the same person twice offers to compare instead of adding a duplicate. A broken or edited link says "This link doesn't work" (every value in the link is checked).
- The birth details travel in the part of the address after `#`, which browsers never send to the website's server.
- The sample chart can't be shared, because it's not a real person.

**Also fixed:** a link opened in a fresh tab showed an empty page at first (the page tried to draw before it had finished loading).

**Testing:** three separate browsers (one person sharing, one adding them, one with no chart on a phone), the copy button, own link, duplicate, broken link; earlier Connections and Welcome tests still pass. No errors.

**AI vs me:** Me: the idea of friends connecting with each other, and choosing the share link for now. Claude: suggested the link as a no-accounts version, wrote the code.

---

## 11 October 2026 (night) · Stage 6: Profile

**What we built** (`profile.html`, `js/pages/profile.js`, `js/save-button.js`, `css/profile.css`), following part 06 of the specification:
- **Your details:** name, birth date, time (or "Unknown"), place and Big Three. The greeting uses your name ("Hello, Salma").
- **Edit my details:** the same form as the Welcome page, already filled in, plus an optional name. Your chart is only replaced once the new details have passed every check and been calculated, so a mistake (like 31 February) can't break it. Afterwards every page uses the new chart.
- **Save to my profile:** a new button on every reading in My Chart and on every topic in Explore. Saved things are listed on Profile with a link back and a Remove button.
- If your details change, saved readings follow your **current** chart, and say so: "Updated: when you saved it, it was Venus in Aquarius", or "Not in your chart right now: it needs an exact birth time".
- **Your data:** says honestly that there are no accounts yet, that everything stays in this browser on this device, and that birth details are never sent to a server (only the city name typed into the place search). It lists what's saved, and has **Download my data** (a file with everything) and **Delete everything** (asks first, right on the page).
- With the made-up sample or no chart, Profile explains there's no profile yet and offers to create your chart. The sample's readings can't be saved.

**Decisions**
- The specification also lists email, password, privacy settings and log out. Those need real accounts, and the spec says to "only show account features that actually work", so they're left out and the page says accounts are coming later.
- The specification suggests a cream page, but we kept the slate grey from my colour palette so every tab feels like the same website.

**Testing:** no chart, sample chart, creating a chart from Profile, editing (prefilled form, unknown time, an impossible date, Cancel keeps the old details), saving and removing readings, the "updated" notes, downloading the file, deleting everything, phone width. Every earlier page test still passes; 79/79 calculation checks.

**AI vs me**
- Me: asked for the Profile page; the three parts come from my specification.
- Claude: wrote the code and texts, and suggested Download my data and the honest "your data" section.

---

## 11 October 2026 (night) · Footer

**My feedback:** remove "ORBIT · a student project for Webs & Apps Design, 2026" from the footer. Done on every page; the credit for the planet-position library stays.

---

## 11 October 2026 (night) · Explanation boxes never cover the wheel

**My feedback:** the explanation box appeared in the middle of the chart and hid it. It should always sit on the outside, so the chart stays visible.

**What changed** (`js/tip-position.js`, used by My Chart and Connections)
- On a computer the box now appears **beside** the wheel, on the side of whatever you're pointing at (or the other side if there's no room), level with it. It usually sits over the "How to read" column, never over the chart.
- With no room at the sides (tablets, phones), it goes just below the wheel, or, if that's off the screen, as a slim strip at the top or bottom edge of the screen, whichever is further from what you tapped, so that part of the chart stays visible.
- Fixed on phones: a tap sometimes opened the box and closed it again immediately. Now a tap opens it and it stays until you tap something else; signs open and close with a second tap. No blue flash when tapping the wheel.

**Testing:** measured the box against the wheel at four screen sizes (1920, 1280, 900 wide, and a 375 px phone) for signs, planets and lines on both pages: no overlap at any size. All earlier page tests still pass.

---

## 11 October 2026 (night) · Easier to read

**My feedback:** (1) the words in italics in brackets on My Chart were very hard to read; (2) the small spaced capitals ("YOUR BIRTH CHART") still needed to be a bit bolder; (3) the words and lines on the wheel needed to be a bit bolder too.

**What changed**
- The notes in brackets ("(how you feel)", "(boldly and directly)") are no longer thin italic serif: they're now in the same clear font as the body text (Manrope), slightly heavier.
- The small spaced capitals: weight 650 → 700 and 12.5 → 13 px, on every page.
- The wheel: sign names bolder, bigger and brighter; house numbers and ASC/MC bolder; rings, dividers, house lines, constellations and aspect lines all more visible. Same on My Universe, My Chart and Connections.
- The topic question on Explore (italic) is a little heavier too.

---

## 11 October 2026 (night) · Sign names the right way up

**My question:** should we turn the sign names that are upside down? Yes: the names on the bottom half of the wheel (Sagittarius, Capricorn, Aquarius, Pisces…) are now turned round so they read normally, like on most chart sites. This works on every wheel, wherever your Rising sign puts each sign.

---

## 12 October 2026 · Friendship / Romance really changes the reading

**My feedback:** pressing Friendship or Romance didn't seem to change the information.

**What was wrong:** it did change, but only one short phrase in each explanation, so the two versions looked almost the same.

**What changed**
- Each link now has two parts:
  1. **The facts** (in softer text): which planets, which signs, and the angle. These never change, because the planets are the same whichever way you read it.
  2. **The meaning**, with a small label **AS FRIENDS** or **AS A COUPLE**: what this pair of planets is about, what it can look like in real life, and how the angle tends to feel. All three sentences are different for friends and for couples.
- New "what it can look like" sentences for all 15 planet pairs, once for friends and once for couples (`js/content/connections.js`), plus a friends and a couple version of how each kind of angle feels.
- Checked in the browser: all 7 explanations in the sample change when switching.

**AI vs me:** Me: spotted that the switch still felt like it did nothing. Claude: rewrote the explanations into facts + meaning and drafted the new texts for me to review.

---

## 12 October 2026 · One Friendship / Romance switch

**My feedback:** keep only the switch right above the explanations. The one at the top of the page didn't change anything you could see there; it only told you to look further down.

**What changed:** removed the top switch and its note. The switch now lives only above "How your charts talk to each other", next to the explanations it changes, and the changed parts glow for a moment when you switch.

---

## 14 October 2026 · Approximate birth time, "Back to…" button, clearer weekly sky and playground

**My feedback**
1. An option for an approximate birth time ("I was born around 9 am").
2. After clicking "Read more" (and similar links) there should be a way back to where I was.
3. "Your sky this week": is it for me or for everyone?
4. The aspect playground wasn't clear.
5. Can the website address be something like orbit.com instead of my username? (Answered separately: needs a decision, see below.)

**What changed**
- **Approximate birth time:** a new question under the time in every birth form (Welcome, Connections, Profile): *How sure are you about this time?* Exact, or give or take 15 minutes, 30 minutes, 1 hour or 2 hours.
  - The planets are calculated at the time you gave (they barely move in a few hours).
  - The Rising sign, Midheaven and houses move fast, so ORBIT checks 9 moments across the whole window and keeps every sign or house that appears. Where they could differ, every page shows all the options: "Rising: Aries or Taurus", "6th or 5th house (approximate time)", with an explanation of each.
  - Weekly sky: with an approximate time, it leaves out moments that depend on your exact Rising sign or houses.
  - New calculation checks: the planets stay the same, the Rising options include the exact one, ± 2 hours gives more than one Rising sign, and 0 means exact. **83/83 checks pass.**
- **"← Back to …" button:** when you follow a link inside a page to another page (Read more →, Explore →, a saved reading…), a small button appears in the bottom-left corner: "← Back to My Universe". It takes you back to the same spot on the page. Choosing a page from the top menu doesn't create it.
- **Your sky this week:** the intro now says the planets move the same way for everyone, and what's personal is how they meet your chart. Every moment has a label: **Your chart** (it touches your own planets) or **Everyone** (it happens in the sky for all of us).
- **Aspect playground:** a short explanation of what an aspect is, then four numbered steps: what the circle is, which planet to drag, what the number means, and what the marks are (and why each angle appears on both sides).
- **Drop-down menus** (Month, How sure…) now match the other boxes: flat, square, with a thin gold arrow, instead of the browser's shiny default button.
- The explanation box on narrow screens now docks on the screen edge that has room, so it never covers the wheel.

**AI vs me**
- Me: all five points came from using the site myself.
- Claude: the approach for each (checking the whole time window, the session-based back button, the labels) and the code.

---

## 16 October 2026 · Organising the project folder like the teacher's drawing

**What my teacher asked:** the final project is handed in as one "Final Project" folder with structure (HTML), style (CSS) and interactivity (JavaScript) kept separate, plus a folder of images that the HTML links to, so the project is organised and easy to keep track of.

**What changed**
- The website itself is now just: the six HTML pages, `css/`, `js/` and a new **`img/`** folder.
- **`img/`** holds ORBIT's icon (a planet circling a star, in my colours): `favicon.svg` for the browser tab and `icon-180.png` for a phone's home screen. Every HTML page links to it in its `<head>`.
- Everything behind the scenes (build log, style and writing guides, accuracy tests, the version helper and the calculation lab) moved into one folder, **`development/`**, so it doesn't mix with the website's files.
- The README now has a map of the folder and explains how the files connect: each HTML page links its CSS in the `<head>`, its JavaScript at the end and its icon from `img/`. None of the HTML pages has styles or scripts written inside it (checked).
- The six HTML pages stay at the top of the folder (not in their own folder) because GitHub Pages needs `index.html` there to open the website.

**Testing:** every page and the lab load with no missing files; 83/83 calculation checks pass; the earlier page tests still pass.

**AI vs me:** Me: brought the teacher's requirements and drew the structure. Claude: moved the files, fixed every link and made the icon.

---

## 20 October 2026 · Watch your chart build, and travel through time

**Why:** my teacher's feedback was "the website will be considered as easy or medium depending on its design and execution", and I want at least medium. We picked three bigger features: these two, and real accounts (next).

**Watch your chart build, step by step** (`js/tour.js`, My Chart)
- The first time you open My Chart, the wheel builds itself in four steps: the signs, your planets, the houses (only with a birth time) and the lines. Each layer fades in, with one short sentence written for your chart ("Your Sun was in Leo and your Moon in Aquarius", "Your chart has 16 lines").
- Next / Skip, a progress bar, Escape to stop. It only plays by itself once; "Watch your chart build, step by step" under the title replays it.
- On phones the step text is a card at the bottom of the screen, so the wheel stays visible above it.

**Travel through time** (`js/time-travel.js`, My Universe)
- A wheel with your chart in gold and the real sky of any day in lilac on the inner ring. A slider goes a year back and a year forward; there are Day buttons, Today, and Play (one day every 0.15 seconds) to watch the planets travel.
- When a planet in the sky comes within 1.5° of a special angle to one of your planets, a line joins them and a list explains it in plain words ("Mars flows with your Pluto…").
- Calculated live with the same code as the birth chart, about 2.5 ms per day.
- On a laptop the wheel stays beside the controls while you scroll; on a phone it comes right before the slider.

**Testing:** every step of the tour, Skip, Escape, replay, no tour when arriving at one explanation; slider by mouse and keyboard, Play/Pause, phone width. No errors.

**AI vs me:** Me: chose these features to raise the difficulty after my teacher's feedback (the step-by-step chart was in my original plan). Claude: designed the details and wrote the code.

---

## 20 October 2026 · Real accounts (built, waiting for the Supabase keys)

**What it does**
- **Profile → Your account:** create an account or log in with email and password; "Forgot your password?" sends a reset link; a confirm-your-email link logs you in.
- When you're logged in, your birth details, your people and your saved readings are saved to your account and come with you to any device. Logging in on a new device downloads them; a change on one device shows on the other the next time a page opens.
- Logging out removes your data from that browser (it stays in your account), so the next person on a shared computer can't see it. "Delete everything" also deletes the account.
- The site still works without an account, exactly as before. My Universe and the Welcome page invite you to create one.

**How it's built** (`js/cloud.js`, `js/account-panel.js`, `js/cloud-config.js`)
- A free **Supabase** project: its login service and one database table, `orbit_data` (one row per person).
- Instead of Supabase's big ready-made library, a short file of our own talks to Supabase with plain `fetch()` requests, so I can read and explain every line.
- **Privacy:** the website only has Supabase's *public* key. Database rules ("row level security", `development/docs/supabase-setup.sql`) let each logged-in person read and change only their own row.
- The browser keeps its own copy (localStorage), so pages still load instantly.

**Testing:** a pretend Supabase inside the test browser: sign up, data saved online, a second device logging in and getting everything, a change on one device appearing on the other, wrong password, bad email, log out, delete account, email confirmation and password reset links. All older tests still pass; 83/83 checks.

**AI vs me:** Me: chose to add accounts to reach at least medium difficulty, and set up the Supabase project. Claude: designed the syncing and wrote the code and the database rules.

---

## 20 October 2026 · Accounts are live, and every account is separate

**Accounts are live.** I ran the database setup in Supabase, added the website's address, and tested it for real: I created an account and got the confirmation email.

**What changed**
- **The account box is now on the first page**, at the top of the form side: "Log in" or "Create account". It's optional; you can still just make your chart. When you're logged in and your chart is already saved, the form is replaced by "Welcome back · Open my universe".
- **Nobody sees anyone else's things**, even on a shared computer:
  - **Logging in** shows only that account's chart, people and saved readings. Whatever was in the browser before is replaced, not mixed in.
  - **A new account starts empty.** If there's already a chart on the device, there's a tick box: "Also save the chart on this device (born …) to my new account". It shows the birth date so you can tell whose it is. It starts unticked on the first page and ticked on Profile (where you usually sign up to keep the chart you just made).
  - **Without an account:** typing *different* birth details on the first page (or opening the sample) counts as a new person, so the last person's people and saved readings are forgotten.
  - **Logging out** clears everything from the browser, so the page is blank for the next person.

**Testing:** pretend Supabase, every case: a friend on my computer as a guest; a friend creating an account on my computer (starts empty); logging in on a computer with someone else's data; signing up on Profile keeping the chart; email confirmation keeping or not keeping; log out. Desktop and phone. No errors; 83/83 checks.

**AI vs me:** Me: tested the live accounts, and decided that each person must start blank and that the account box belongs on the first page. Claude: worked out the rules for each case and wrote the code.

---

## 20 October 2026 · My Chart shows the full chart straight away

**What changed:** the step-by-step build no longer starts by itself the first time you open My Chart. A friend testing the site found it confusing to arrive at a blank wheel. Now the full chart is there immediately, and **"Watch your chart build, step by step"** is a clear outlined button under the title for anyone who wants the guided version.

**Testing:** the chart opens complete at 1024, 1280, 1440 and 1920 px wide, nothing hangs off the side, the button starts the step-by-step version, no errors.

**AI vs me:** Me: noticed the problem while a friend tried the site, and decided the full chart should come first with the steps as an option. Claude: changed the code and the button.

---

## 20 October 2026 · Confirming your email on another device

**Problem (found by a friend testing):** she created an account on her laptop, opened the confirmation email on her iPhone, and was logged in on the phone, but the laptop kept waiting until she refreshed.

**Fix:** while the page says "we sent you a link", it now checks by itself whether the email has been confirmed: every 15 seconds, and straight away when you come back to the tab. As soon as it's confirmed (on any device), the laptop logs in too. The password is only kept in the page's memory while it waits, never saved, and it stops checking after 30 minutes.

**Testing:** pretend Supabase: signing up on the first page and on Profile, confirming "on another device", the laptop logging itself in when you return to the tab and by the 15-second timer, and no error shown while it's still waiting. 83/83 checks.

**AI vs me:** Me: found the problem with a real user. Claude: designed the fix and wrote the code.

---

## 20 October 2026 · Easier-to-read subheading on the first page

**Feedback from a friend:** "cambia el font del subheading porque no se puede leer muy claro" (the subheading font is hard to read).

**Change:** "An exploration of your personal universe." is still in Bodoni Moda, but upright and a little heavier instead of thin italic. Bodoni's italic has very thin strokes, which are hard to read on a dark background. It stays elegant and matches the style guide (Bodoni for titles).

**AI vs me:** Me: collected the feedback and decided to act on it. Claude: chose upright semi-bold Bodoni and checked it on a laptop and a phone.

---

## 20 October 2026 · Clearer "Delete everything" question

When you're logged in, "Delete everything" deletes your account too, but the question still said "from this browser". It now says "…your account (email), your birth details… for good, on every device? This can't be undone." Without an account it still says "from this browser".

**AI vs me:** Me: asked what the button does. Claude: noticed the wording didn't match and fixed it.

---

## 20 October 2026 · New address: orbit-astrology.github.io

**What changed:** ORBIT moved from `salmaabudayeh9.github.io/ORBIT/` to **https://orbit-astrology.github.io**, a cleaner address without my username.

**How:** I made a free GitHub organization called **orbit-astrology**, transferred the project into it, and renamed it `orbit-astrology.github.io` (that special name makes it the organization's main website). I kept my own username. GitHub Pages publishes it from the `main` branch. In Supabase, the Site URL now points to the new address, so account emails link there.

**Good to know:** the old link no longer works. Accounts are safe because they're stored in Supabase, not on the website, so people just log in once on the new address.

**AI vs me:** Me: wanted an address without my username, chose the organization name, and did the transfer, rename and settings. Claude: explained the options and guided each step.

---

## 20 October 2026 · A calmer first page and My Universe

**Why:** friends who tried ORBIT loved the explanations but found some pages a lot to take in at once. Nothing was removed; the extras now come in smaller doses.

**What changed**
- **First page:** only the birth form shows. The account box is behind a small **"Log in"** link in the top corner (it opens with the log-in form ready). When you're logged in, it shows who's logged in, with Log out.
- **My Universe, "Your sky this week":** each moment shows its title and one short line; **"Read more"** opens the full explanation. The two notes under the title became one.
- **My Universe, "Travel through time":** stays on this page (I like it here), with a shorter intro. The list shows the 3 closest angles; **"Show 6 more"** opens the rest and stays open while you move through the days.
- **Connections:** the notes now say details are saved in this browser *and in your account if you're logged in* (they said "only in this browser", which was out of date).
- My Universe is about 20% shorter on a laptop.

**Testing:** laptop and phone sizes, Log in link, creating an account from it, logging out, Read more, Show more and moving the slider afterwards. No errors; 83/83 checks.

**AI vs me:** Me: decided the site should feel calmer, chose to keep Travel through time on My Universe, and approved the rest. Claude: proposed what to fold away and wrote the code.
