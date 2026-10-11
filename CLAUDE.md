# ORBIT: notes for anyone (or any AI) working on this project

ORBIT is an interactive personal astrology website, a student project for Webs & Apps Design (final deadline 20 November 2026). The idea and creative direction belong to the student, Salma; AI helps with code and explains it.

## Non-negotiable rules

1. **Everything is explained for beginners.** Follow `docs/writing-guide.md` for every piece of text on the site: every astrology word is explained in plain language where it appears.
2. **Never fake chart data.** All placements come from `js/astro/chart.js`. No random or hard-coded signs for real users, and never a Rising sign or houses when the birth time is unknown.
3. **Plain HTML, CSS and JavaScript** on GitHub Pages, no framework or build step. Code must stay simple enough for the student to explain, with plain-language comments.
4. **Visual direction:** editorial and elegant; high-contrast serif headings (Bodoni Moda) with a clean sans for text; square corners, thin lines, no rounded cards or pill buttons; muted section colors; restrained motion.
5. **Work in small stages**, explain each change simply, and add an entry to `docs/build-log.md` (what was done, decisions, and what AI did vs what Salma decided).

## Checking accuracy

`node tests/run-tests.js` must pass before any change to the calculation code is saved.
