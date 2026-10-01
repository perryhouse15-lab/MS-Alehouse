# Mississippi Ale House — Website Rebuild

Static site (no build step). Open `index.html` or serve the `site/` folder from any static host (Netlify, Vercel, GoDaddy hosting, S3…).

## Structure
- `index.html` — single-page homepage (bottle-fill preloader with arc reveal, hero video, ticker, experience cards, weekly lineup, about, visit, footer)
- `css/style.css` — all styles; design tokens (colors/spacing/type) live in `:root` at the top
- `js/main.js` — header state, mobile nav, ticker loop, motion pause controls, GSAP scroll animations
- `assets/` — hero video, logo, and photos pulled from the original mississippialehouse.com
- `robots.txt` / `sitemap.xml` — crawl basics; both hardcode `https://mississippialehouse.com/`

## Design system
- Display font: **Anton** · Body font: **Inter** (Google Fonts)
- Palette: warm near-black `#14110c`, cream `#f3ebdd`, amber `#e9a13b`, rust `#c05a2e`, sage `#8a9464`
- Animation: GSAP 3 + ScrollTrigger (CDN); `prefers-reduced-motion` fully respected

## Updating content
- **Hours / events:** edit the "weekly lineup" list and the Visit hours in `index.html`
- **Ticker phrases:** edit the `.tk` spans inside `.ticker-track` (JS duplicates them automatically)
- **Tap list link:** currently `https://taplist.io/taplist-474915` (3 places: header, hero, about)
- **Cards:** each card is an `<a class="xcard">` — swap the image/SVG or the link target

## Assets and images
Photos are served with `srcset`. Each has pre-generated widths beside the original —
`taproom-800/-1200.jpg` and `beergarden-600/-900.jpg`. **Replacing a photo means
regenerating its variants too**, or the small screens keep serving the old picture.
`favicon-32.png` and `icon-180.png` are cropped from the circular badge in `logo.png`.
`hero-poster.jpg` is the video's poster frame and also the Open Graph preview image.

## Conventions worth keeping
- **Absolute URLs in `<head>`.** `og:image`, `twitter:image` and `canonical` must stay
  absolute — a relative `og:image` renders a blank Facebook preview.
- **Anything that moves needs a pause control.** The hero video and the ticker each have
  one (`.motion-toggle`), revealed by JS only when there is motion to stop (WCAG 2.2.2).
- **`prefers-reduced-motion` is honoured in CSS *and* JS.** The hero video carries no
  `autoplay` attribute on purpose: playback is started from `js/main.js`, so
  reduced-motion visitors never download the 5 MB file.
- **External links** carry `rel="noopener"` and an `.sr-only` "(opens in a new tab)" cue.
- The mobile nav panel is hidden with `visibility`, not `transform` alone — without that
  its links stay in the keyboard tab order while closed.

## External links preserved from the current site
Tap list (taplist.io), Facebook, food options, band booking, shop, privacy, terms.
