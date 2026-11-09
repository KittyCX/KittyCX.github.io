# Leo Xu — Personal Website

Personal profile page for Leo Xu (Grade 9 · 2026).

Built as a static site — plain HTML + CSS + a little vanilla JS, no build step:

- `index.html` — homepage **is a climbing wall**: four holds form a route
  (About me → Rock Climbing → Projects → Help). Tap the correct next hold to
  light it up and open its page; a wrong hold makes you fall and the route
  resets. Progress is saved in `localStorage`.
- `about.html` — "About me" placeholder page (content coming soon)
- `climbing.html` — "Rock Climbing" placeholder page (content coming soon)
- `projects.html` — "Projects" placeholder page (content coming soon)
- `help.html` — "Help" page: three ways I can help (Delta Force coin runs,
  Genshin dailies, craftsmanship), each with expandable details
- `how-can-i-help.md` — reflection document for the "How can I help" assignment
- `css/style.css` — design tokens, wall/hold styles, inner-page styles
- `js/climb.js` — climbing-wall game logic (order checking, light-up, fall, reset)

All pages share a fixed top menu bar: **Home · About me · Help**.

Deployed with GitHub Pages via the workflow in `.github/workflows/`.
