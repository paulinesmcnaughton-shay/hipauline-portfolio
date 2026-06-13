# Handoff: Pauline Shay Portfolio — "Red Pill / Blue Pill"

## Overview
A two-personality portfolio site for **Pauline Shay, Lead Product Designer**:

1. A cinematic **System Entry** front door (a vintage CRT in a white gallery) lets the visitor choose a pill.
2. **Red pill** → the **Matrix portfolio** (digital-rain homepage + editorial About page + warp transitions).
3. **Blue pill** → the **traditional, recruiter-facing portfolio** (clean white, typographic) with 16 case-study pages.

The two worlds cross-link: the blue-pill site has an "Enter the Matrix ↗" nav link; the Matrix menu has a "Take the Blue Pill" item.

## About the Design Files
The files in this bundle are **design references created in HTML** — working prototypes that show the intended look, copy, and behavior. They are **not production code to ship directly**. Your task in Cursor is to **recreate these designs in your codebase's environment** (the copy on the site itself names Next.js + Supabase as the stack — Next.js App Router is the recommended target) using its established patterns. Open the HTML files in a browser to see every interaction live; read their inline `<style>` and `<script>` blocks for the exact values and logic.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, animations, and interactions are final. Recreate pixel-perfectly. Exact values live in the inline CSS of each page plus `site.css` / `projects/case-study.css`.

## Sitemap & Suggested Routes

| Page name | Design file | Suggested route |
|---|---|---|
| System Entry (intro / front door) | `Pauline's Intro.html` | `/` |
| Matrix Home (red pill) | `Alternative Portfolio.html` | `/matrix` |
| About Me (Matrix world) | `About.html` | `/about` |
| Classic Portfolio (blue pill, main site) | `Main Portfolio - Blue Pill.html` | `/portfolio` |
| Case studies (blue-pill world) | `projects/*.html` | `/projects/[slug]` |

Case-study slugs (16 pages, titles as in each file's `<title>`):
`wildkind`, `ankrd`, `cengage`, `cisco` (Cisco Meraki), `vca` (Mars VCA), `enora`, `games` (Little Sort), `pete-health`, `wheels`, `perromart`, `hyperloop` (Hyperloop TT), `fokcus`, `wag`, `pipli`, `selected-product-work`.

> Note: the `PROJECTS` array in `site.js` (the single source of truth for project nav, newest → oldest) contains mixed-case routes like `/projects/Games`, `/projects/Cisco`, `/projects/VCA`. Normalize all routes to lowercase when implementing. `Enora` and `ANKrD` are flagged `soon: true` (shown disabled with a "soon" tag in the Matrix menu/rain).

## Screens / Views

### 1. System Entry (`Pauline's Intro.html` + `intro.js`)
- **Purpose**: cinematic front door; visitor picks red or blue pill.
- **Layout**: full-viewport white gallery (`--gallery: #f4f3f0`, soft radial floor gradient, blurred contact shadow). A vintage CRT photo (`assets/crt.png`) is centered; its glass region (positioned at `left 31.9% / top 19.9%, 25.8% × 29.4%` of the image) hosts a live terminal overlay with scanlines, phosphor glow, curved-glass vignette, and a power-on flash.
- **Sequence** (driven by `intro.js`): power-on → slow camera push (`#crt` scales 0.62 → 1.0 over ~2.6s) → terminal types greeting lines → two choice buttons appear: **"> Take the Red Pill"** (red, `--red-pill #e01228`) and **"> Take the Blue Pill"** (blue `#6fa8ff`).
- **Red pill** → text glitch (RGB-split keyframes) → green portal bloom (`#portal`, radial gradient that swallows the viewport, 0.95s ease-in) → navigate to Matrix Home.
- **Blue pill** → clean body fade-out (0.7s) → navigate to Classic Portfolio.
- **Extras**: "skip intro →" button bottom-right (appears after a beat); gallery placard top-left ("PAULINE SHAY // SYSTEM ENTRY"); full reduced-motion fallbacks.
- Terminal font: `"SFMono-Regular", "JetBrains Mono", Menlo, Consolas, monospace`; phosphor color token `--term-color: #5dff96`.

### 2. Matrix Home (`Alternative Portfolio.html`)
- **Purpose**: red-pill homepage; project nav is hidden inside digital rain.
- **Layout**: fixed full-viewport, `overflow: hidden`. Layers bottom→top: (0) `<canvas id="rain">` random katakana-style rain; (1) radial dark vignette for legibility; (2) centered hero — name (clamp 24–32px), role "LEAD PRODUCT DESIGNER" (letter-spacing 0.32em), neon flickering line "AI-ASSISTED FULL-STACK PRODUCT DESIGNER", a short lede paragraph, hint "hidden in the rain — find the glowing words"; (3) clickable **project-name columns**: each project from `PROJECTS` falls as a vertical column of glowing letters (26px, letter-by-letter reveal, hover = brighter `hot` state with bloom). A blue easter-egg column "Take the Blue Pill" (`#5b9dff`) links to the Classic Portfolio. `soon` projects render at 62% opacity, non-clickable.
- Clicking a column triggers the shared **warp transition** then navigates.

### 3. About Me (`About.html`)
- **Purpose**: long-form editorial essay about Pauline.
- **Layout**: dark (`#050806`), single 680px column, generous vertical padding. Serif (`Newsreader`, 17–20px, line-height 1.82). Title with a blinking neon period. Project names inside the essay are neon-green italics. Ends with a "coda" of larger closing lines. Uses the shared Matrix chrome (cursor, menu, spinner, warp).

### 4. Classic Portfolio (`Main Portfolio - Blue Pill.html`)
- **Purpose**: the professional recruiter-facing site. One long page.
- **Theme attributes** on `<html>`: `data-theme="light|dark"`, `data-font="grotesk|serif"`, `data-cards="flat|bordered"` — implement as user-facing or build-time variants (defaults: light / grotesk / flat).
- **Sections** (anchor nav): sticky blurred nav (`Home · Work · About · Resume · Contact · Enter the Matrix ↗`) → **Hero** (360px portrait + name, eyebrow "Lead Product Designer", two ledes, CTA buttons "View Work →" and "Resume") → **Featured product work** (`#work`, 2-col card grid: WildKind, ANKrD, Cengage, Cisco Meraki, Mars VCA, Enora (work-in-progress overlay), … each card = keynote hero image + title + industry tag + summary, hover lift −4px) → **About** (`#about`) → skills → **Contact** (`#contact`, link grid: LinkedIn, Email, Case Study 🔒, Resume 🔒, Medium, GitHub) → footer.
- **NDA note** under the work heading (lock icon + "Some projects contain modified visuals or generalized descriptions…").
- Scroll-reveal animation on `.reveal` elements; responsive collapse at 860px (single column, nav links hidden except Matrix link).

### 5. Case-study pages (`projects/*.html` + `projects/case-study.css`)
- **Purpose**: per-project case studies in the blue-pill visual system.
- **Shared shell**: sticky nav (same as main page, wordmark links back), back link "← " with hover slide, full-width hero image (16/7, radius 20px, soft shadow), then per-project content. Some pages carry a "Work in progress" overlay. Several pages embed real product screenshots from `assets/`.
- `selected-product-work.html` is a gallery page of additional shipped work.

## Shared Chrome (Matrix world — `site.css` + `site.js`)
Injected on every Matrix-world page by `site.js`:
- **Custom cursor**: neon dot + trailing "snake letters" that follow the pointer (monospace, glowing; turns blue over blue-pill links). Hidden on touch devices (`pointer: coarse`); native cursor suppressed only when active.
- **Menu**: fixed hamburger top-right (48×48, neon hairlines) → right drawer (370px, dark glass, blur). Items: HOME, the 12 projects (numbered `idx`, `soon` items disabled with pill tag), ABOUT ME separated on top/bottom borders, and a blue "Take the Blue Pill" item.
- **Spinner**: a small always-spinning Inception totem, fixed bottom-left at 32% opacity; tooltip "SYSTEM ONLINE" on hover.
- **Warp transition**: full-screen overlay with "> ACCESS GRANTED" title + 3 per-section `//` loading lines (copy table `WARP_COPY` in `site.js`), then a perspective zoom-out (`scale 2.7, blur 11px, 0.86s`) before navigation. Every page plays a matching **warp-in** on load (`[data-page]`: scale 1.12 + blur → none, 0.9s). Reduced-motion: plain fades.

## Interactions & Behavior
- Navigation between Matrix pages always goes through the warp overlay (`data-warp` attribute names the section for loading copy).
- **Password-gated downloads** (blue-pill page): "Resume" and "Case Study" links open a modal; the file is fetched as an encrypted blob (`assets/resume.enc`, `assets/casestudy.enc`) and decrypted client-side via WebCrypto — **AES-GCM**, key from **PBKDF2 (150,000 iterations, SHA-256)**; file layout = 16-byte salt + 12-byte IV + ciphertext. Downloads as `Pauline-Shay-CV.pdf` / `Pauline-Shay-Case-Study.pdf`. Keep this exact mechanism (the `.enc` files are included and work as-is when served over HTTP).
- All animations have `prefers-reduced-motion` fallbacks — preserve them.

## State Management
Almost none needed: menu open/closed, warp transitioning flag, intro sequence run state, decrypt-modal state (idle / wrong password / success), and the blue-pill theme attributes. No data fetching beyond the static `.enc` files.

## Design Tokens

**Matrix world** (`site.css`):
- `--neon: #5dff96` · `--neon-soft: #34e87a` · `--red-pill: #e01228` · `--bg: #000400` · blue accent `#5b9dff` · body text `#d6ffe2` / `#c4f7d6`
- Font: `"SFMono-Regular", "JetBrains Mono", "Cascadia Mono", Menlo, Consolas, monospace`
- About page: `Newsreader` serif on `#050806`

**Blue-pill world** (inline `:root` + `projects/case-study.css`):
- `--accent: #2a6fdb` · `--bg: #ffffff` · `--bg-subtle: #fafafa` · `--text: #0d0e11` · `--text-2: #565a61` · `--text-3: #8b9098` · `--border: #ececef` · `--border-strong: #e0e1e5` · `--radius: 16px` · `--maxw: 1140px` · ease `cubic-bezier(0.22, 1, 0.36, 1)`
- Dark theme overrides under `html[data-theme="dark"]` (bg `#0a0b0d`, surface `#131519`, etc.)
- Fonts (Google Fonts): **Schibsted Grotesk** (400–800, body + headings) and **Newsreader** (serif heading variant + About page)

## Assets
- `assets/crt.png` — the intro machine photo (positioning percentages in the intro CSS are measured against this exact image; don't swap it without re-measuring).
- `assets/work-*.png` — keynote-style hero images for every work card / case-study page.
- `assets/cisco-shot.png`, `assets/game-*.png`, `assets/pipli-*.png`, `assets/pauline-*.png`, `assets/desk-hand.png`, `assets/gaming-arms.png` — in-page case-study imagery.
- `assets/resume.enc`, `assets/casestudy.enc` — AES-GCM-encrypted PDFs (see Interactions).
- **`<image-slot>` placeholders** (hero portrait `#bp-portrait` on the blue-pill page, possibly others): this is a design-tool drop-target component (`image-slot.js`). Images dropped into it live in the design tool, **not in this bundle**. Replace each `<image-slot>` with a real `<img>` (same size/shape: portrait is 4/5 ratio, radius 18) and ask Pauline for the final photos.

## Files
- `Pauline's Intro.html`, `intro.js` — System Entry page + its engine
- `Alternative Portfolio.html` — Matrix Home
- `About.html` — About Me
- `Main Portfolio - Blue Pill.html` — Classic Portfolio
- `site.css`, `site.js` — shared Matrix chrome (cursor, menu, spinner, warp, PROJECTS list, warp copy)
- `projects/` — 16 case-study pages + `case-study.css`
- `assets/` — all imagery + encrypted PDFs
- `reference_screenshots/` — captured reference images of every page: intro (boot + pill choice), Matrix home (rain + open menu drawer), About (top + coda), Blue Pill main page (6 scroll segments: hero, work grid ×2, about, contact, footer), and every case-study page (top + mid-scroll). Use these to visually verify your implementation; the HTML files remain the source of truth.
- `tweaks-panel.jsx`, `intro-tweaks.jsx`, `blue-pill-tweaks.jsx` — **design-time controls only.** These power an in-prototype settings panel (and the React/Babel CDN script tags exist only for them). **Do not implement them**; strip those script tags. The only thing worth keeping from them is the set of theme variants they toggle (`data-theme` / `data-font` / `data-cards` on the blue-pill page; pace/glitch tunables in `intro.js`).

## How to run locally

The site must be served over HTTP — it uses `fetch()` for the password-gated resume/case study files, which does not work with `file://` URLs.

**Option 1 — npx serve (recommended):**
```
npx serve .
```
Then open `http://localhost:3000` in your browser.

**Option 2 — Python (if already installed):**
```
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## How to deploy to Vercel

1. Push this folder to a GitHub repository (create one if you don't have one).
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repo. Vercel auto-detects this as a **Static Site** — no framework setting needed.
4. Click **Deploy**. Your site will be live within seconds.
5. To connect `hipauline.com`: in Vercel go to **Project → Settings → Domains**, add `hipauline.com`, then update your domain registrar's DNS with the values Vercel gives you.

The `vercel.json` file in this repo enables clean URLs (no `.html` in the address bar).

## File map

| File | URL on site |
|---|---|
| `index.html` | `hipauline.com` (intro / front door) |
| `matrix.html` | `hipauline.com/matrix` (red pill, Matrix home) |
| `about.html` | `hipauline.com/about` (About Me) |
| `portfolio.html` | `hipauline.com/portfolio` (blue pill, classic portfolio) |
| `projects/*.html` | `hipauline.com/projects/[name]` (case studies) |
