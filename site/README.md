# Mississippi Ale House — Website Rebuild

Static site (no build step). Open `index.html` or serve the `site/` folder from any static host (Netlify, Vercel, GoDaddy hosting, S3…).

## Structure
- `index.html` — single-page homepage (bottle-fill preloader with arc reveal, hero video, ticker, experience cards, weekly lineup, about, visit, footer)
- `css/style.css` — all styles; design tokens (colors/spacing/type) live in `:root` at the top
- `js/main.js` — header state, mobile nav, ticker loop, GSAP scroll animations
- `assets/` — hero video, logo, and photos pulled from the original mississippialehouse.com

## Design system
- Display font: **Anton** · Body font: **Inter** (Google Fonts)
- Palette: warm near-black `#14110c`, cream `#f3ebdd`, amber `#e9a13b`, rust `#c05a2e`, sage `#8a9464`
- Animation: GSAP 3 + ScrollTrigger (CDN); `prefers-reduced-motion` fully respected

## Updating content
- **Hours / events:** edit the "weekly lineup" list and the Visit hours in `index.html`
- **Ticker phrases:** edit the `.tk` spans inside `.ticker-track` (JS duplicates them automatically)
- **Tap list link:** currently `https://taplist.io/taplist-474915` (3 places: header, hero, about)
- **Cards:** each card is an `<a class="xcard">` — swap the image/SVG or the link target

## External links preserved from the current site
Tap list (taplist.io), Facebook, food options, band booking, shop, privacy, terms.
