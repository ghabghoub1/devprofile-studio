# DevProfile Studio v0.4.4

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

## Quality checks

```bash
npm test
npm run build
```

The app displays its version from `package.json`. For a future release, update the version using `npm version <new-version> --no-git-tag-version`, then update this README heading.

## Build

```bash
npm run build
```
## Documentation

New to DevProfile Studio? Follow the [step-by-step User Guide](docs/USER-GUIDE.md) to connect GitHub, edit your profile, preview changes, and publish your README.

Want to contribute? Read the [Developer Guide](docs/DEVELOPER-GUIDE.md) for local setup, architecture, development workflow, and release checks.

**Featured projects:** Enter one project per line using `Project Name | Optional description`. The description is optional; a project name alone is valid.
