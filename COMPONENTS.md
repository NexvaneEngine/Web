# Nexvane Web - Component & Responsivity Update

Plain HTML/CSS/JS, no build step - just static files. Everything below
works by dropping a `<script src="...">` tag in a page's `<head>`/`<body>`,
same as the original `theme.js`.

**All paths in this project are relative (no leading `/`).** That's
deliberate: a leading-slash path like `/scripts/theme.js` only resolves
correctly when served from a web server whose root is exactly this
folder. Opened straight off disk (double-clicking `index.html`, i.e.
`file://`) or served from a different root, it 404s - and since the
navbar/footer/sidebar are rendered by that JS, the whole page ends up
looking broken (no nav, no footer, nothing interactive). Relative paths
work everywhere, so that failure mode is gone. See "Nested pages" below
for how this stays true even for pages in subfolders.

## What's new

```
scripts/
  theme.js                    shared light/dark controller -> window.NXTheme
  components/
    nx-navbar.js               <nx-navbar></nx-navbar>
    nx-footer.js                <nx-footer></nx-footer>
    nx-sidebar.js               <nx-sidebar>, <nx-sidebar-node>, <nx-sidebar-leaf>
styles/
  base.css                     (existing tokens/nav/cards - lightly restructured, same look)
  components.css               sidebar styles + .page-with-sidebar layout
  responsive.css                all @media rules: mobile nav, sidebar drawer, cards, banner
docs/
  manual.html                  live example page using all three components
```

## 1. Reusing the navbar & footer

Any page just needs:

```html
<head>
  ...
  <link rel="stylesheet" href="styles/base.css"/>
  <link rel="stylesheet" href="styles/components.css"/>
  <link rel="stylesheet" href="styles/responsive.css"/>
  <script src="scripts/theme.js"></script>
</head>
<body>
  <nx-navbar></nx-navbar>

  <main>...page content...</main>

  <nx-footer></nx-footer>
</body>
<script src="scripts/components/nx-navbar.js"></script>
<script src="scripts/components/nx-footer.js"></script>
```

Both components render the exact same markup/classes the original hand-written
`<nav>`/`<footer>` used, so nothing about the visual design changed - you're
just not copy-pasting ~60 lines of nav markup into every page anymore.
`<nx-navbar>` also owns the mobile hamburger menu and wires the theme-toggle
button to `window.NXTheme` automatically.

## 2. The sidebar (nodes you can expand, leafs you can click)

Declare a tree per-page - this is the "instance" part: same component,
different content on every page that needs one.

```html
<div class="page-with-sidebar">
  <nx-sidebar label="User Manual">
    <nx-sidebar-node label="Getting Started" icon="bi-rocket-takeoff" open>
      <nx-sidebar-leaf label="Installation" href="docs/manual.html#installation"></nx-sidebar-leaf>
      <nx-sidebar-leaf label="Quick Start" href="docs/manual.html#quick-start"></nx-sidebar-leaf>
    </nx-sidebar-node>

    <nx-sidebar-node label="Editor" icon="bi-window">
      <nx-sidebar-leaf label="Scene Hierarchy" href="docs/manual.html#scene-hierarchy"></nx-sidebar-leaf>
      <!-- nodes can nest other nodes -->
      <nx-sidebar-node label="Inspector" icon="bi-sliders">
        <nx-sidebar-leaf label="Components" href="docs/manual.html#components"></nx-sidebar-leaf>
      </nx-sidebar-node>
    </nx-sidebar-node>

    <nx-sidebar-leaf label="FAQ" icon="bi-question-circle" href="docs/manual.html#faq"></nx-sidebar-leaf>
  </nx-sidebar>

  <main>
    ...page content...
  </main>
</div>
```

```html
<script src="scripts/components/nx-sidebar.js"></script>
```

- `<nx-sidebar-leaf label="..." href="..." icon="bi-...">` - a clickable
  link, styled with the same `.nav-button` class as the navbar (per your
  "should look like the nav buttons" ask). It automatically gets an
  `.active` state when its `href` matches the current page (and, for
  in-page anchors, only once that anchor is the current one).
- `<nx-sidebar-node label="..." icon="bi-..." open>` - clicking (or
  Enter/Space) its header expands/collapses its children. Add the `open`
  attribute to have it start expanded. Nodes can contain more nodes or leafs.
- `<nx-sidebar label="...">` - the instance wrapper; `label` becomes the
  section title shown above the tree (and the mobile drawer's toggle
  button text).
- Icons are any Bootstrap Icons class (the project already loads that font),
  e.g. `icon="bi-gear-fill"`. Omit `icon` to show label-only.

See `docs/manual.html` for a full working example - it's already wired up
and demonstrates a second sidebar instance with its own content, nested
nodes, and the default `open` state.

## 3. Nested pages (pages in a subfolder)

`docs/manual.html` lives one folder below the project root, but its
`<head>` still writes every path exactly like `index.html` does -
`styles/base.css`, `scripts/theme.js`, `docs/manual.html#faq`, etc. That
works because of one line at the very top of its `<head>`:

```html
<base href="../">
```

`<base>` tells the browser "resolve every relative URL on this page - CSS,
scripts, links, and anything components insert dynamically - against this
folder instead of the page's own folder." So the exact same component
code, with the exact same relative paths, works correctly whether it's
loaded from `index.html` (root) or `docs/manual.html` (one level down).

Any future page one level deep (`docs/api.html`, `download/windows.html`,
`about/engine.html`, ...) just needs that same `<base href="../">` line
and can otherwise copy `docs/manual.html`'s `<head>`/script tags verbatim.
A page two levels deep would use `<base href="../../">`.

## 4. Responsivity

`styles/responsive.css` adds the following - no color/spacing tokens or
visual style were changed, only how things reflow at narrower widths
(breakpoint: 900px):

- **Navbar**: hover dropdowns become a hamburger menu; tapping a dropdown
  opens it as an inline accordion (touch has no hover).
- **Sidebar**: the static column becomes an off-canvas drawer with a
  toggle button and a click-to-close backdrop. Tapping a leaf on mobile
  closes the drawer behind it.
- **Cards**: single column on narrow screens; fixed `75vh` card height
  switches to a `16:9` image + auto height so cards don't force excessive
  scrolling.
- **Banner/content padding**: scales down on small screens.

A `<meta name="viewport">` tag was also added to `index.html` and
`docs/manual.html` - it was missing before, and without it none of the
above media queries take effect on real phones.

## Notes

- `base.css`'s `nav` rules were restructured slightly (new `.nav-top` /
  `.nav-links` / `.nav-group` wrappers replacing the old `nav > div`
  selectors) to make room for the hamburger button. Desktop output is
  unchanged - this only affects the underlying structure, not the look.
- Components render into **light DOM** (not Shadow DOM) on purpose, so all
  existing CSS keeps working unmodified and the real `<nav>`/`<footer>`
  tags stay in the accessibility tree as proper landmarks. The custom
  element tags themselves (`<nx-navbar>`, `<nx-footer>`, `<nx-sidebar>`)
  are `display: contents`, so they don't add any extra boxes to the layout.
- `styles/index.css`'s `url(...)` image references were changed from
  `/img/...` to `../img/...` - CSS files resolve their own relative URLs
  against the stylesheet's own location, not the page's, so this one only
  needed a one-time fix regardless of how many pages load it.
- The five small icon glyphs on the Windows/Linux/Git/Manual download
  cards use a CSS `mask-image` referencing an SVG. Chromium blocks that
  specific combination under `file://` (a CORS restriction on masked SVGs
  with a `null` origin) even though the path is correct - it's a
  browser-specific quirk of that technique, present in the original design,
  and only affects double-clicking the file directly; it renders fine from
  any real server (`python -m http.server`, GitHub Pages, etc.), which is
  how the site is meant to be previewed/deployed.
