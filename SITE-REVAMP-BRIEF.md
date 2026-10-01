# MS Alehouse — Site Revamp Brief

**Prepared:** 2026-10-01 · **Source:** weekly automated site review (2026-09-28)
**Audience:** the Claude session doing the revamp implementation
**Subject:** `site/` — the static rebuild of mississippialehouse.com

---

## 0. How to use this document

This is a handoff brief, not a spec you must follow literally. Everything in §2
(**Verified current state**) was measured directly against the files in this repo —
trust those numbers rather than re-deriving them. Everything in §5 (**Backlog**) is
prioritized by expected business impact, with the file locations already looked up.

Three rules that matter:

1. **§3 lists what is already good. Do not regress it.** This site is better built
   than most small-venue sites. The gaps are in conversion and discovery, not craft.
2. **§6 lists questions only the owner can answer.** Several backlog items are blocked
   on business decisions (email platform, event data source, domain plan). Don't guess
   — build the structure and leave a clearly marked TODO, or ask.
3. **Do not invent factual content.** Hours, address, and phone below are taken from
   the existing markup. Anything not in §2 (geo coordinates, band names, food menu
   items, social handles beyond Facebook) must come from the owner, not from you.

---

## 1. Repo map

```
MS-Alehouse/
├── README.md                  # one-liner
├── card screenshot.png        # 1.0 MB, unused by the site — stray file at repo root
├── SITE-REVAMP-BRIEF.md       # this file
└── site/
    ├── README.md              # genuinely useful; author's own notes on structure + how to edit content
    ├── index.html             # 326 lines — the entire site, one page
    ├── css/style.css          # 558 lines — all styles, design tokens in :root at top
    ├── js/main.js             # 181 lines — header state, mobile nav, ticker loop, GSAP animations
    └── assets/                # 5.7 MB total
        ├── hero.mp4           # 5.25 MB
        ├── taproom.jpg        # 260 KB
        ├── beergarden.jpg     # 171 KB
        ├── hero-poster.png    # 143 KB  (⚠ actually a JPEG — see P2-3)
        └── logo.png           # 22 KB
```

**Stack:** hand-written static HTML/CSS/JS. **No build step, no package.json, no
dependencies to install.** Open `site/index.html` directly, or serve the folder:

```bash
cd site && python3 -m http.server 8000
```

**Third-party runtime dependencies** (both via CDN, both in `index.html` at the end of `<body>`):
- GSAP 3.12.5 + ScrollTrigger from `cdn.jsdelivr.net` (~110 KB combined)
- Google Fonts: Anton (display) + Inter (body), loaded with `display=swap` and `preconnect` — correctly done

**Git:** develop on branch `claude/eloquent-maxwell-xe09eo`. Repo is
`perryhouse15-lab/ms-alehouse`. Only two commits exist (`f1deda6` initial,
`312d028` upload) — there is no CI, no test suite, and no linting configured.

---

## 2. Verified current state

Measured directly. Don't re-derive these.

### 2.1 Business facts as currently published on the page

| Field | Value | Where |
|---|---|---|
| Name | Mississippi Ale House | `index.html:253` |
| Address | 9211 MS-178, Olive Branch, MS 38654 | `index.html:253` |
| Phone | (901) 326-2716 | `index.html:255` |
| Sun–Mon | Closed | `index.html:260` |
| Tue–Thu | 3–10 PM | `index.html:261` |
| Fri | 3–11 PM | `index.html:262` |
| Sat | 1–11 PM | `index.html:263` |
| Taps | 30 rotating | `index.html:238` |

Weekly events (`index.html:198–224`): Tue Music Bingo 6–8 · Wed Community Night 6–8 ·
Thu Karaoke 6–10 · Fri Patio Music 7–10 · Sat Patio Music 5–8 + DJ 8–11.

⚠ **Hours are published in two places** — the lineup list (`index.html:198–224`) and
the Visit `<dl>` (`index.html:259–264`). They currently agree. Any change must touch both.

### 2.2 Asset measurements

| File | Real format | Dimensions | Size | Notes |
|---|---|---|---|---|
| `hero.mp4` | MP4, video track only (no audio) | — | 5.25 MB | **14.2 s, ~2.96 Mbps** — autoplays on all devices |
| `hero-poster.png` | **JPEG** (misnamed `.png`) | 1920×1080 | 143 KB | Also referenced as the `og:image` |
| `taproom.jpg` | JPEG (Sony ILME-FX30, Lightroom) | 1600×1067 | 260 KB | Served full-size to phones |
| `beergarden.jpg` | JPEG | 1200×800 | 171 KB | Used **twice** (card + About) |
| `logo.png` | PNG, 8-bit colormap | 873×291 | 22 KB | Also serves as the favicon |

### 2.3 Audit counts (all verified by grep)

| Check | Result |
|---|---|
| `<form>` / `<input>` elements | **0** |
| `application/ld+json` blocks | **0** |
| `rel="canonical"` | **0** |
| `twitter:*` meta tags | **0** |
| `theme-color` meta | **0** |
| `sitemap.xml` / `robots.txt` | **neither exists** |
| `target="_blank"` links | **14** (all correctly carry `rel="noopener"`) |
| `<img>` tags | 5 — **all 5 have alt text** |
| `<img>` with width/height | 2 of 5 (both logos; the 3 content images lack them) |
| Heading structure | one `h1`, four `h2`, six `h3` — correctly ordered, no skips |

### 2.4 Color contrast (WCAG AA) — all passing

| Pairing | Ratio | Verdict |
|---|---|---|
| `--cream` on `--ink` | 15.91:1 | AAA |
| `--amber-hi` on `--ink-2` | 10.08:1 | AAA |
| `--amber` on `--ink` | 8.63:1 | AAA |
| `--cream-dim` on `--ink` | 8.59:1 | AAA |
| `--cream-dim` on `--ink-2` | 8.07:1 | AAA |
| `.tint-sage` on `--ink-2` | 8.24:1 | AAA |
| `.btn-solid` text on `--amber` | 7.85:1 | AAA |
| `.tint-rust` on `--ink-2` | 5.94:1 | AA |
| `.tk-sage` text on sage | 5.46:1 | AA |
| `.tk-rust` text on rust | 3.74:1 | AA (large text only — it is 30px+ display type, so it passes) |

**Keep this property.** If you change the palette, re-run the contrast check. The
only pairing with no headroom is `.tk-rust`, which passes solely because the ticker
type is large; don't reuse that combination at body size.

### 2.5 Preloader timing (measured from `js/main.js`)

`2.4 s` bottle fill (`main.js:97`) + `0.3 s` hold + `1.05 s` curtain (`main.js:107–108`)
= **~3.75 s before content is reachable, on every single page load**, with
`html.no-scroll` applied (`main.js:86`) and `.anim-hero` held at `opacity: 0`.
There is no first-visit-only check.

---

## 3. What is already good — do not regress

Carried over verbatim because it would be easy to lose in a rewrite:

- **Design tokens.** All color, spacing, type, radius, and easing live in `:root`
  (`css/style.css:7–36`). Palette: `--ink #14110c` (warm near-black, deliberately
  never pure `#000`), `--cream #f3ebdd`, `--amber #e9a13b`, `--rust #c05a2e`,
  `--sage #8a9464`. Keep the token discipline.
- **Real responsive breakpoints** at 1023px and 767px (`css/style.css:513`, `520`),
  including a sensible mobile reflow of the lineup grid from 3 columns to 2 with the
  event text spanning full width.
- **`prefers-reduced-motion` is handled in two places** (`css/style.css:142`, `552`
  and `js/main.js:5`, `66`, `73`) — the preloader is removed entirely, the ticker
  stops, transitions collapse to 0.01ms. This is more thorough than most sites.
  (One gap remains: the hero video. See P4-1.)
- **Skip link** (`index.html:20`, styled `css/style.css:52–59`) and a global
  `:focus-visible` outline (`css/style.css:61`).
- **Keyboard-accessible cards** — `.xcard-arrow` reveals on `:focus-visible`, not
  just `:hover` (`css/style.css:357–358`).
- **Semantic markup** — `<address>` for the address, `<dl>` for hours, `tel:` link
  on the phone number, `aria-label` on both `<nav>`s, correct `aria-expanded` /
  `aria-controls` on the nav toggle, Escape-key handler that returns focus.
- **Graceful CDN degradation** — `main.js:66` removes the preloader entirely if GSAP
  fails to load, so a blocked CDN can never leave the page stuck behind a curtain
  or with invisible content. Preserve this guard pattern in any refactor.
- **Good `<title>` and `<meta name="description">`** (`index.html:6–7`) — specific,
  keyword-rich, locally targeted. Don't dilute them.
- **`site/README.md`** documents where to edit hours, ticker phrases, and the tap
  list link. Keep it current as you change structure.

---

## 4. Benchmarks

⚠ **Methodology caveat:** the review container's egress proxy blocked direct fetches
of these sites, so these observations come from published design reviews and
roundups, not first-hand page inspection. **Verify against the live sites before
treating any detail as fact.**

| Site | What it does well — and what to borrow |
|---|---|
| **Market Garden Brewery** (Cleveland) | Separate `/events`, `/upcoming-events`, and `/beer` pages. Recurring nights are *named and described* ("Trivia Night with Logan", "Karaoke Night with Logan") rather than listed as formats. Event spaces are merchandised individually with a direct inquiry route. **The closest structural model for MS Alehouse.** |
| **Green Cheek Beer Co.** (Costa Mesa) | Mascot-driven identity (green-cheek parakeet) carried consistently across site, packaging, and merch; community and events lead the homepage. Shows that a strong single visual idea beats generic "craft" styling. |
| **Other Half Brewing** (Brooklyn) | Multiple taproom locations surfaced cleanly without clutter; strong art direction integrated with commerce. Relevant if a second location is ever on the table. |
| **Olympia Oyster Bar** (Portland) | Splits "Upcoming Events" from "Weekly Happenings" as two distinct homepage blocks — exactly the distinction MS Alehouse is currently missing. |
| **Old Lady Gang** (Atlanta) | Booking form placed at the *center* of the homepage, showing live availability without requiring a phone call. |
| **Goose Island / Lagunitas** | Bold type and large-scale imagery with personality, while navigation stays clear. Proof that heavy art direction need not cost UX — directly relevant to keeping the Anton/ticker/preloader character while fixing performance. |

**Recurring themes across all of them:** the beer list is on-domain; events are
dated and named; there is always an email capture; mobile is treated as the primary
device; and page weight is kept low because most visits are on cellular, in transit.

**Sources:**
- https://www.cyberoptik.net/blog/best-brewery-websites/
- https://www.marketgardenbrewery.com/events · https://www.marketgardenbrewery.com/beer
- https://www.greencheekbeer.com/
- https://otherhalfbrewing.com/
- https://www.soliddigital.com/blog/top-beer-brand-websites-design-inspiration-worth-raising-a-glass-to
- https://pos.toasttab.com/blog/on-the-line/best-bar-websites
- https://support.toasttab.com/en/article/Optimize-Toast-Websites (Untappd / tap-list embeds)
- https://schemaengineai.com/blog/localbusiness-schema-gbp-guide/
- https://linkgathering.com/blog/restaurant-seo
- https://www.sitebuilderreport.com/inspiration/bar-websites

---

## 5. Prioritized backlog

Ordered by expected impact. Each item: **why**, **where**, **done when**.

### P0 — Conversion. Nothing on this page captures a visitor or keeps them on-domain.

#### P0-1 · Add email (and ideally SMS) capture
There are **zero form elements on the entire site**. A visitor who loves the place
has no way to be reached again.
- **Why:** every benchmark treats the homepage as a list-building tool. A venue with
  five themed nights a week has more reason than most to own a direct channel —
  it's the cheapest way to fill a slow Tuesday.
- **Where:** new section above `<footer>` (`index.html:301`).
- **Blocked on:** which provider (§6, Q1).
- **Done when:** a single-field form with a real `<label>` (visible or
  `sr-only` — not placeholder-only), inline success and error states, a
  keyboard-reachable submit, and no layout shift when the message appears.

#### P0-2 · Bring the tap list on-domain
Three of the strongest CTAs — header (`index.html:62`), the first experience card
(`index.html:118`), and the About button (`index.html:244`) — all bounce the visitor
to `taplist.io/taplist-474915`.
- **Why:** the beer list is the #1 reason someone opens a brewery site. Toast
  documents tap-list embeds as a standard integration precisely because of this;
  Market Garden keeps it on-domain at `/beer`. Sending the highest-intent traffic
  off-site costs the conversion *and* the SEO value.
- **Options:** embed the taplist.io widget; pull its feed and render server-side at
  build/deploy; or hand-maintain a list. Embedding is lowest-effort but adds a
  third-party script — weigh against P2 performance goals.
- **Done when:** current taps render on an MS Alehouse URL, with the taplist.io link
  demoted to a secondary "full list" affordance.

#### P0-3 · Publish dated, named events — not just the weekly format grid
The lineup says "Patio Music · Fri 7–10 PM" but **never names the band**.
- **Why:** recurring format answers "what kind of night is Friday"; dated listings
  answer "should I come *this* Friday" — and they're what gets shared. Olympia
  Oyster Bar runs both blocks separately; Market Garden names even its recurring hosts.
- **Where:** new section near the existing `#events` (`index.html:193`). Keep the
  weekly grid — it's good — and add dated listings above it.
- **Blocked on:** where event data comes from (§6, Q2).
- **Done when:** upcoming dated events render with name, date, time, and (ideally)
  an image; past events drop off automatically rather than needing manual deletion;
  each event carries `Event` JSON-LD (see P1-1).

#### P0-4 · Add a private-event / large-party inquiry path
Band booking is linked (`index.html:163`), but a visitor wanting to bring 20 people
or reserve the patio has **no entry point at all**.
- **Why:** Market Garden merchandises its event spaces individually with direct
  inquiry routes. With fire pits and a patio, this is real bookable revenue with
  zero on-page path today.
- **Note:** this is *not* necessarily table reservations — many bars don't take them.
  Frame it as "book the beer garden / large party inquiry" unless the owner says
  otherwise (§6, Q3).
- **Done when:** a form or clearly-labeled contact route exists, with party size,
  date, and contact fields.

#### P0-5 · Bring the food menu on-domain
`/food-options` currently opens in a new tab on another domain (`index.html:148`, `310`).
- **Why:** "do they have food?" is a top-three question for a bar. Sending it
  off-domain costs the answer and the SEO value both.
- **Blocked on:** whether real menu content exists to pull in (§6, Q4).

### P1 — SEO and local discovery

#### P1-1 · Add structured data. There is currently none.
- **Why:** current local-SEO guidance is explicit that generic markup is not enough —
  use the most specific type available. For a bar that's `BarOrPub`. This is the
  single biggest lever for local and AI-assisted search visibility.
- **Where:** new `<script type="application/ld+json">` in `<head>`.
- **Use:** `BarOrPub` with `name`, `address` (PostalAddress), `telephone`,
  `openingHoursSpecification`, `url`, `image`, `priceRange`, `sameAs` (Facebook),
  and `hasMenu` once P0-5 lands. Add `Event` entries per P0-3.
- ⚠ **`geo` coordinates are not in this repo — do not invent them.** Look them up
  from the real listing or omit the property.
- ⚠ **NAP must match the Google Business Profile character-for-character.** Mismatches
  actively reduce trust signals. Confirm the GBP spelling before shipping (§6, Q5).
- **Starter snippet:** §8.1.
- **Done when:** it validates in Google's Rich Results Test with no errors.

#### P1-2 · Fix `og:image` — it is a relative path and will render blank
`index.html:12` is `content="assets/hero-poster.png"`. Open Graph **requires an
absolute URL**.
- **Why:** Facebook and iMessage previews are broken right now, and Facebook is the
  *only* social channel the site links to (`index.html:267`) — so this directly
  degrades their primary distribution channel. Highest impact-per-character fix on
  this entire list.
- **Also:** add `og:image:width` / `:height` (1920×1080), `og:site_name`,
  `og:locale`, and a `twitter:card` block (none exist).

#### P1-3 · Add the missing head and crawl basics
All absent: `rel="canonical"`, `twitter:*`, `theme-color` (use `#14110c`),
`apple-touch-icon`, plus `sitemap.xml` and `robots.txt` (neither file exists).
Low effort, standard on every benchmark. **Snippet:** §8.2.

#### P1-4 · Consider splitting into multiple pages
A single page can only rank for one cluster.
- **Why:** separate `/events`, `/beer-garden`, `/tap-list`, `/food` URLs are what let
  Market Garden and Green Cheek capture "live music Olive Branch MS" or "beer garden
  near Southaven" individually. The current one-pager can't target them separately.
- **Weigh honestly:** the one-page design is genuinely good and a multi-page split is
  the largest structural change on this list. A defensible middle path is to keep the
  homepage as the showcase and add 2–3 deep pages for the high-intent queries.
- **Blocked on:** domain plan (§6, Q6).

### P2 — Performance and asset weight

#### P2-1 · Gate the hero video
5.25 MB, 14.2 s, ~2.96 Mbps, `autoplay` with no conditions (`index.html:73–74`).
No `<source media="...">`, no JS width check.
- **Why:** most brewery-site traffic is mobile and in transit — often on cellular,
  deciding where to go right now. Shipping 5 MB before they can read the hours is
  the most expensive thing this page does.
- **Fix:** serve the poster only below ~900px and load the video on desktop; also
  re-encode (the current ~3 Mbps for a 14 s silent loop is well above what's needed
  — target under 1.5 MB) and add a WebM source.
- **Snippet:** §8.3.
- **Done when:** a mobile viewport transfers no `.mp4` bytes.

#### P2-2 · Make the preloader first-visit-only
~3.75 s on **every** load, scroll locked (§2.5).
- **Why:** it's a charming animation and worth keeping — but it delays LCP on every
  visit, including every return visit from a regular checking tonight's lineup.
  Goose Island's use of motion works because it isn't gating the first paint.
- **Fix:** `sessionStorage` flag — full animation for new visitors, skipped for
  returning ones. Also consider shortening the fill from 2.4 s.
- **Keep:** the `main.js:66` CDN-failure guard.

#### P2-3 · `hero-poster.png` is actually a JPEG
Confirmed by file-type inspection: JPEG data, 1920×1080, despite the `.png` extension.
Referenced at `index.html:12` (og:image) and `index.html:73` (video poster).
- **Fix:** rename to `.jpg` and update both references. Then serve WebP/AVIF for it
  plus `taproom.jpg` and `beergarden.jpg` — roughly 60–70% off a 5.7 MB asset folder.

#### P2-4 · Add `width`/`height` and `srcset` to the three content images
`index.html:120`, `142`, `233` have no intrinsic dimensions → layout shift. And a
1600px-wide `taproom.jpg` is currently served to a 390px phone.

#### P2-5 · Reconsider the GSAP dependency (~110 KB)
The guard in `main.js` is well-written and degrades cleanly — but the reveals,
stagger, and count-ups are all achievable with `IntersectionObserver` plus CSS at a
fraction of the weight and one fewer third-party dependency.
- **Judgment call, not a defect.** If the animation polish is a priority, keeping
  GSAP is defensible. If P2 page-weight goals are binding, this is the easiest 110 KB.

#### P2-6 · Delete the stray 1.0 MB `card screenshot.png` at the repo root
Unused by the site. Confirm with the owner first in case it's a reference asset.

### P3 — Content and polish

- **P3-1 · De-duplicate the hours.** Published twice (§2.1). They agree now; they'll
  drift on the first schedule change — and Google penalizes hour mismatches. Make one
  the source of truth. A dynamic "Open now / Closed" badge would also answer the most
  common mobile question instantly.
- **P3-2 · Define "Community Night"** (`index.html:207`). Every other slot names a
  specific format; this one doesn't, and an unexplained event draws no one.
- **P3-3 · Expand the photography.** The site has **only two real photos**, and
  `beergarden.jpg` is used twice (`index.html:142`, `233`). Fire pits, patio, live
  music, a full taproom — these are what sell this place, and roundups consistently
  cite imagery as the emotional hook. A small gallery would carry real weight.
- **P3-4 · Add Instagram and social proof.** Facebook is the only channel linked, and
  there are no reviews or ratings anywhere. Green Cheek's pull is built on visible community.
- **P3-5 · The `.visit-map` is a hand-drawn SVG, not a real map** (`index.html:270–297`).
  Defensible for performance and it looks good — but the streets aren't recognizable.
  Consider a lazy-loaded static map image.
- **P3-6 · Dead code:** `.line-outline` (`css/style.css:233`) is defined but never used.
- **P3-7 · Confirm the `og:url` domain plan.** `index.html:11` points at
  `https://mississippialehouse.com/` — the same domain this rebuild links *out* to
  (`index.html:148`, `163`, `175`, `316`). Those links need revisiting on cutover (§6, Q6).

### P4 — Accessibility

#### P4-1 · The hero video has no pause control and ignores reduced-motion
`index.html:73` — `autoplay muted loop`, running 14.2 s on repeat.
- **Why:** WCAG 2.2.2 requires a pause mechanism for motion over five seconds. And
  the CSS reduced-motion block **cannot stop a `<video>`** — this is the one real gap
  in otherwise-thorough reduced-motion handling.
- **Fix:** call `video.pause()` in JS on the same media query `main.js:5` already
  reads, and add a visible pause/play control.

#### P4-2 · The ticker pauses on hover only
`css/style.css:272` — `.ticker:hover`. Not on focus, not reachable on touch at all.
Same WCAG 2.2.2 issue.

#### P4-3 · The closed mobile nav stays in the keyboard tab order
`css/style.css:522–536` hides `.main-nav` with `transform: translateY(-115%)` only —
no `visibility: hidden`, no `inert`, no `display` change. Keyboard users on mobile tab
through five invisible links. **Real bug, cheap fix.**
- Also add a body-scroll lock and focus trap while it's open. The `aria-expanded`
  wiring and Escape handler (`main.js:28–41`) are already correct — build on them.

#### P4-4 · Screen readers will read the ticker phrases repeatedly
`main.js:51` clones items to fill the viewport **without** setting `aria-hidden`; only
the second doubling pass (`main.js:58`) marks clones hidden. Mark *every* clone
`aria-hidden="true"`.

#### P4-5 · Add an "opens in new window" cue to the 14 `target="_blank"` links
All correctly carry `rel="noopener"` — only the user-facing cue is missing.

#### P4-6 · Replace the favicon
`logo.png` is 873×291 (`index.html:13`), so it renders as a squashed sliver at 16×16.
Needs a square mark plus an `apple-touch-icon`.

---

## 6. Open questions for the owner — blocking work above

| # | Question | Blocks |
|---|---|---|
| Q1 | Which email/SMS platform? (Mailchimp, Klaviyo, Square, something already in use?) | P0-1 |
| Q2 | Where do dated events live today — Facebook Events, a spreadsheet, the owner's head? That determines whether we embed, sync, or hand-maintain. | P0-3 |
| Q3 | Do they take table reservations at all, or is the need specifically private-party / beer-garden booking? | P0-4 |
| Q4 | Is there real food menu content to bring on-site, or is food handled by rotating trucks/vendors? | P0-5 |
| Q5 | Exact NAP spelling on the Google Business Profile, and the venue's lat/long. | P1-1 |
| Q6 | Is this rebuild replacing mississippialehouse.com at the same domain? If so, the 6 links pointing *out* to that domain all need revisiting. | P1-4, P3-7 |
| Q7 | Instagram / TikTok handles, if any. | P3-4 |
| Q8 | Can we get more photography, or should we plan around the two existing images? | P3-3 |

**Do not invent answers to these.** Build the structure, leave a marked TODO, ship
the rest.

---

## 7. Suggested phasing

**Phase 1 — unblocked quick wins (no owner input needed).** P1-2 og:image, P1-3 head
basics, P2-3 poster rename, P2-4 dimensions + srcset, P4-1 through P4-6 accessibility,
P3-6 dead code. All small, independently verifiable, zero business decisions. Ship as
one PR. This alone fixes broken Facebook previews and every accessibility defect found.

**Phase 2 — performance.** P2-1 video gating, P2-2 preloader, P2-6 stray file.
Measure before/after; the goal is a mobile first-load well under 1 MB.

**Phase 3 — structured data.** P1-1, once Q5 is answered.

**Phase 4 — conversion.** P0-1 through P0-5, as answers to Q1–Q4 come in. Largest
effort, largest payoff. P0-2 (tap list) and P0-1 (email) are the two to do first if
the budget is limited.

**Phase 5 — structure and content.** P1-4 multi-page split, P3-1 through P3-5.

**Verification, since there is no test suite:** check the rendered page at 390px,
768px, and 1440px; tab through the whole page with the mobile nav both open and
closed; run with `prefers-reduced-motion: reduce` forced on; throttle to Fast 3G and
confirm no 5 MB video on mobile; validate structured data in the Rich Results Test;
re-run the §2.4 contrast table if the palette changed; and confirm the page still
works with the jsdelivr CDN blocked (the `main.js:66` guard).

---

## 8. Ready-to-use snippets

Starting points to adapt, not finished code. **Every `TODO` below is a real unknown —
don't fill it with a guess.**

### 8.1 `BarOrPub` JSON-LD

Hours transcribed from §2.1. Confirm NAP against the Google Business Profile (Q5).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  "name": "Mississippi Ale House",
  "url": "https://mississippialehouse.com/",
  "telephone": "+1-901-326-2716",
  "image": "https://mississippialehouse.com/assets/hero-poster.jpg",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "9211 MS-178",
    "addressLocality": "Olive Branch",
    "addressRegion": "MS",
    "postalCode": "38654",
    "addressCountry": "US"
  },
  "sameAs": ["https://www.facebook.com/MississippiAleHouse/"],
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Tuesday", "Wednesday", "Thursday"],
      "opens": "15:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday", "opens": "15:00", "closes": "23:00" },
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday", "opens": "13:00", "closes": "23:00" }
  ]
}
</script>
```

Omit `geo` entirely rather than guessing coordinates. Sunday and Monday are simply
absent, which is how schema.org expresses "closed" — don't add zero-length entries.

### 8.2 Head tags to add

```html
<link rel="canonical" href="https://mississippialehouse.com/" />
<meta name="theme-color" content="#14110c" />

<!-- og:image MUST be absolute (currently relative — this is the P1-2 bug) -->
<meta property="og:image" content="https://mississippialehouse.com/assets/hero-poster.jpg" />
<meta property="og:image:width" content="1920" />
<meta property="og:image:height" content="1080" />
<meta property="og:site_name" content="Mississippi Ale House" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Mississippi Ale House — Olive Branch's Craft Beer Destination" />
<meta name="twitter:description" content="30 rotating taps. Live music. Beer garden with fire pits. Tue–Sat in Olive Branch, MS." />
<meta name="twitter:image" content="https://mississippialehouse.com/assets/hero-poster.jpg" />

<link rel="apple-touch-icon" href="assets/icon-180.png" />
```

### 8.3 Hero video — gate on viewport, and honor reduced-motion

Remove `autoplay` and the `<source>` from the markup; attach both in JS so a phone
never requests the file. Keep the `poster` so the hero still renders.

```html
<video class="hero-video" id="heroVideo" muted loop playsinline
       preload="none" poster="assets/hero-poster.jpg" aria-hidden="true"
       data-src="assets/hero.mp4"></video>
```

```js
var hero = document.getElementById("heroVideo");
var wantsVideo = window.matchMedia("(min-width: 900px)").matches && !prefersReducedMotion;
if (hero && wantsVideo) {
  var s = document.createElement("source");
  s.src = hero.dataset.src;
  s.type = "video/mp4";
  hero.appendChild(s);
  hero.load();
  hero.play().catch(function () { /* autoplay refused — poster stands in */ });
}
```

Then add a visible pause/play control for P4-1. `prefersReducedMotion` is already
defined at `main.js:5`.

### 8.4 Mobile nav — remove closed links from the tab order (P4-3)

`css/style.css:532` currently moves the panel with `transform` alone. Add:

```css
.main-nav { visibility: hidden; }
.main-nav.is-open { visibility: visible; }
```

Scoped inside the existing `@media (max-width: 767px)` block, and guarded so the
desktop nav is unaffected. `visibility: hidden` is animation-safe here because it
inherits — children become unfocusable, and the existing transform transition still
runs. Pair it with a body-scroll lock on open.

---

## 9. One-line summary for whoever picks this up

The craft is good and the gaps are structural: **nothing on this page captures a
visitor** (zero forms), **the best CTAs send them off-domain** (tap list, food), and
**there is no structured data at all** — while a 5 MB video and a 3.75-second
preloader greet every arrival. Fix Phase 1 and Phase 2 first; they're unblocked,
cheap, and include a broken Facebook preview that's costing them their main channel today.
