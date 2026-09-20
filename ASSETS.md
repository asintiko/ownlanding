# Static assets (canonical location)

This file documents the `public/assets/` directory convention for this project.

All local images, videos, and fonts referenced by runtime code MUST live under
`public/assets/`. Vite copies everything in `public/` verbatim into the
production bundle root, so these files survive `build` + publish.

## Layout

```
public/assets/
├── images/          # all site images (hero, logo, products, avatars, ...)
│   └── placeholder.svg
├── videos/          # local video files (optional)
└── fonts/           # self-hosted fonts (optional)
```

## Reference rule (single canonical form)

Always reference assets with a **root-absolute URL path** — leading slash, no
`public/` prefix:

```jsx
<img src="/assets/images/brand-logo.png" alt="Logo" />
```

```css
.hero { background-image: url('/assets/images/hero-banner.jpg'); }
```

## Never do

- `src="assets/images/x.png"` — relative path; breaks on nested routes and CDN sub-paths
- `src="public/assets/images/x.png"` — `public/` is not part of the served URL
- `src="../assets/x.png"` / `./assets/x.png` — same relative-path breakage
- placing images in `<project>/assets/` or `src/assets/` — not copied into `dist/`
  (unless explicitly `import`-ed, which this project convention does not use)

## Replacing an image? Rename it

Files under `public/` are served without content hashes, so CDN edges and
browsers cache them by URL. Overwriting a file with new content under the
**same name** can keep serving the stale image until caches expire.

When replacing an existing image, save it under a **new filename** (e.g.
`brand-logo-v2.png` or a short content hash suffix) and update the single
code reference. Never overwrite an existing file in place with different
content.

---

# Image Manifest — Katy Delma · Links

Every image rendered by this project. Source values: `imageGenerate`, `user-provided`,
`existing-CDN`, `placeholder`.

| # | Slot | File / URL | Source | Intended usage | Status |
|---|------|-----------|--------|----------------|--------|
| 1 | Full-bleed card background | `/assets/images/golden-hour-coast.jpg` | `imageGenerate` | Page background photograph behind the link-in-bio card; fills the card edge to edge under the readability scrim. Decorative (`alt=""`). | ready — 1024×1536 JPEG, 457 KB |
| 2 | Creator avatar | `/assets/images/katy-delma-avatar.jpg` | `imageGenerate` | Circular avatar at the top of the card; square source cropped by `border-radius`/`object-fit`. Alt text carries the creator name. | ready — 1024×1024 JPEG, 310 KB |

## Generation record

| Slot | Tool | Params | Count |
|------|------|--------|-------|
| 1 | `image_generate` | `aspect_ratio: 9:16`, `resolution: 2K` (model returned 1024×1536) | 1 |
| 2 | `image_generate` | `aspect_ratio: 1:1`, `resolution: 1K` | 1 |

Generated images used in this build request: **2** of the 8-image ceiling (no additional
allocation requested).

### Prompts

1. **Background** — a golden-hour coastal shore: soft hazy sky upper third, calm pale
   turquoise sea meeting wet sand with generous negative space through the middle,
   weathered timber walkway and smooth stones in the lower third; an entirely
   unpopulated shore; 35mm at eye level, deep focus; low warm sun from the upper
   right, soft haze and long soft shadows; warm sand / cream / ochre / pale turquoise
   palette with muted terracotta in the timber, low saturation, sunlit editorial grade.
   Avoided: text, logos, watermarks, HDR oversaturation, plastic CGI look.

2. **Avatar** — a warm sunlit editorial head-and-shoulders portrait of a woman in her
   early thirties who reads as an outdoorsy travel and hiking blogger; square 1:1 with
   clear headroom for a circular mask; 85mm at eye level, shallow depth of field;
   coastal headland at golden hour, blurred behind her; cream linen shirt, natural
   honey-blonde hair; low saturation, sunlit magazine grade.
   Avoided: text, logos, watermarks, heavy retouching, sunglasses, hats, other people.

## Provenance and disclosure

- Both images are **AI-generated original artwork** created for this project. They are
  concept imagery, not documentary photographs, and do not depict an identifiable
  real person or a specific real location.
- The supplied visual reference (a link-in-bio page for the same persona) uses its own
  photographic assets. Those assets were **not** copied into this project; both slots
  were re-sourced as original imagery that preserves the intended visual role
  (golden-hour seaside background; sunlit creator portrait).
- `public/assets/images/placeholder.svg` ships with the base template and is **unused**
  in this build.

## Verification

- Both referenced files exist under `public/assets/` and are non-empty and decodable.
- Runtime references use root-absolute `/assets/images/...` paths (no `public/` prefix,
  no relative path), matching the reference rule above.
- No external image URLs are referenced at runtime.

---

# Runtime uploads (local content studio)

The studio writes newly uploaded images into the same canonical folder as the
generated assets: `public/assets/images/`. They are referenced at runtime with the
same root-absolute form (`/assets/images/<name>`), so they are served by the dev
server and copied into a production build automatically.

- Filenames are generated, never overwritten: the original name is slugified and
  suffixed with a short unique id (for example `my-photo-mu9rj51o-i0j8t.png`).
- Accepted formats: JPG, PNG, WEBP. Maximum size: 8 MB.
- The stored path is recorded in the local SQLite database (see below), never in
  this manifest, because uploads happen after this file is written.
- Two editable image slots exist: the creator avatar and the card background. Both
  keep the aspect-role described in the Image Manifest above; replacements are
  chosen by the operator and are not sourced from stock or the web.

# Local database

The studio's content lives in `studio/data/site.sqlite3` (SQLite, created and seeded
from `src/data/defaultContent.js` on first run). It is local-only, single-operator,
ignored by version control, and holds the profile fields, the theme colours and the
ordered link collection. A production build bakes the current database content into
the bundle, so a published build always shows the last saved state.

---

# Typefaces

The page's two typefaces are chosen in the console from twelve predefined
options (six display, six body) and stored with the content beside the images,
colours and rows. Every option is a **system font stack** — the project ships
**no font files**, references **no font CDN**, and uses **no `@import`**. There is
therefore nothing to add to this manifest for them, and nothing to download at
runtime. Every family offered carries Cyrillic, so a Cyrillic name, bio or
caption renders in the chosen face rather than falling back to a different one.
