# Leo Xu — Personal Website

Personal profile page for Leo Xu (Grade 9 · 2026).

The whole site is **one page**: a wooden climbing wall. Built as a static
site — plain HTML + CSS + a little vanilla JS, no build step:

- `index.html` — the climbing wall. Four holds form a route
  (About me → Rock Climbing → Projects → Help). Tap the correct next hold to
  light it up and open its **popup card**; a wrong hold makes you fall and the
  route resets. Progress is saved in `localStorage`. All content lives in the
  popup cards at the bottom of this file.
- `css/style.css` — design tokens, wall/hold styles, popup styles, offer cards
- `js/climb.js` — climbing-wall game logic (order checking, light-up, fall,
  reset, popup open/close)
- `assets/holds/hold-*.png` — generated resin climbing-hold photos
  (backgrounds removed) used for the route holds and the decorative holds
- `how-can-i-help.md` — reflection document for the "How can I help" assignment

There is no navigation bar: the wall is the navigation.

Deployed with GitHub Pages via the workflow in `.github/workflows/`.
