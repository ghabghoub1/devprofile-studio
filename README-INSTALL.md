# DevProfile Studio v0.4.2 — Profile actions patch

Replace only `app/page.tsx` and `app/globals.css` in your existing working v0.4.2 project.

The GitHub Connect / Smart Import components and library files remain unchanged.

In Profile Editor, click the `...` menu:
- **Clear profile**: clears name, username, headline, location, bio, skills, projects, and LinkedIn URL; preserves template, accent, sections, and banner.
- **Reset to example**: restores original example and clears uploaded banner state.

Both actions ask for confirmation. Clear does not disconnect GitHub Connect or modify Smart Import state.

Run `npm run build` and `npm run dev` to verify locally.
