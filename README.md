# DevProfile Studio v0.3.0

Visual GitHub profile README builder with templates, personal banners, and live previews.

## Run locally

```bash
npm install
npm run dev
```

## Banner Studio

Open the **Banner** tab to upload a PNG/JPG/WebP (up to 5 MB) or enter a public HTTPS image URL. Enable the banner to show it above your README content. The **README only / GitHub layout** toggle provides an illustrative GitHub sidebar (your actual avatar is not duplicated inside README).

- Uploaded banners are session-only; export a ZIP before refreshing or closing the page. The ZIP includes `README.md` and `assets/banner.png`.
- URL banners export `README.md` with the hosted URL. The image must remain publicly accessible.
- The GitHub layout is an approximation, not a pixel-perfect GitHub renderer.
- Other profile fields and settings persist in localStorage.

## Build

```bash
npm run build
```
