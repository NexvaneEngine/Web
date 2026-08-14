# What changed

No build step / framework was added - these are plain Web Components
(`customElements.define`), rendered as regular light-DOM HTML, so every
existing rule in `styles/base.css` keeps styling them unchanged. Open
`index.html` or `docs/manual.html` directly in a server the way you already
were; nothing new needs to be installed.

## 1. Reusable components (`components/`)

- `nex-navbar.js` -> `<nex-navbar></nex-navbar>`
- `nex-footer.js` -> `<nex-footer></nex-footer>`
- `nex-sidebar.js` -> `<nex-sidebar>...</nex-sidebar>`

Include the relevant script(s) once in a page's `<head>`, then drop the tag
anywhere in the body. Each tag is a self-contained "instance" - use as many
as you like, on as many pages as you like, and they all stay in sync with a
single source file. To change the navbar site-wide, edit `nex-navbar.js`
once.

## 2. Sidebar (`<nex-sidebar>`)

Declare the tree as plain markup, any depth:

```html
<nex-sidebar label="User Manual">
  <nex-node label="Getting Started" icon="bi-rocket-takeoff-fill" open>
    <nex-leaf label="Installation" href="/docs/manual.html#installation"></nex-leaf>
    <nex-leaf label="Quick Start" href="/docs/manual.html#quick-start"></nex-leaf>
  </nex-node>
  <nex-node label="Editor" icon="bi-joystick">
    <nex-node label="Assets" icon="bi-box-seam">
      <nex-leaf label="Importing Assets" href="/docs/manual.html#importing-assets"></nex-leaf>
    </nex-node>
  </nex-node>
  <nex-leaf label="API Reference" icon="bi-journal-code" href="/docs/api.html"></nex-leaf>
</nex-sidebar>
```

- `<nex-node>`: `label`, `icon` (optional, any Bootstrap Icons class),
  `href` (optional - makes the node itself a link as well as a
  toggle), `open` (boolean - starts expanded).
- `<nex-leaf>`: `label`, `icon` (optional), `href`.
- Clicking a node's row (or its caret) expands/collapses it. Clicking a leaf
  navigates. Items reuse the `.nav-button` class, so they look and hover the
  same as the top navbar buttons.
- The node containing the current page/hash auto-expands, and the matching
  leaf is highlighted.
- See `docs/manual.html` for a full working example, paired with
  `.docs-layout` / `.docs-content` in `styles/components.css` for the
  sidebar + content layout.

## 3. Responsiveness

The visual design (colors, spacing, components) wasn't changed - only how it
reflows below 900px (and 480px for extra-small phones):

- The navbar collapses behind a hamburger button; its dropdowns become
  tap-to-open accordions instead of hover flyouts.
- `<nex-sidebar>` collapses behind a "Contents" bar and the docs layout
  stacks the sidebar above the content instead of beside it.
- Banner text, headings, and page padding scale down; cards stop using a
  fixed height so they don't get awkwardly tall in a single column.

All of it lives in `styles/base.css` (nav/banner/cards, appended at the
bottom under "RESPONSIVENESS") and the new `styles/components.css`
(sidebar + docs layout).

## Files touched

- `styles/base.css` - nav markup was split into three flat children
  (`.nav-bar-row`, `.nav-links`, `.nav-right`) so a hamburger button could
  be added without changing the desktop layout; responsive rules appended.
- `styles/components.css` - **new**, sidebar + docs layout styles.
- `components/nex-navbar.js`, `components/nex-footer.js`,
  `components/nex-sidebar.js` - **new**.
- `index.html` - now uses `<nex-navbar>`/`<nex-footer>` instead of inline
  markup. Banner/cards content untouched.
- `docs/manual.html` - **new**, demo page wiring navbar + sidebar + footer
  together (this is what the "Documentation -> User Manual" link already
  pointed to).
