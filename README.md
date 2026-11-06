# DevProfile Studio

An open-source visual GitHub profile README editor. **v0.1 MVP**.

## Features
- Live, GitHub-inspired profile preview
- Edit introduction, skills, projects, and social links
- Reorder and toggle profile sections
- Custom preview accent colors
- Markdown source view, copy and download
- Automatic local draft persistence (browser localStorage)

## Run locally

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scope and limitations

This MVP has no login, backend, or publishing integration. The stats section exports links to third-party dynamic cards, which may be unavailable or rate-limited. The editor's visual preview is GitHub-inspired, not a pixel-perfect GitHub renderer. Accent colors apply to the preview, not GitHub's Markdown output. User-entered data remains in localStorage until cleared.

## Next milestones

1. Markdown rendering parity and editable templates.
2. GitHub public-profile import.
3. Self-generated SVG statistics and optional GitHub Actions workflow.
4. GitHub OAuth/App integration and explicit user-approved publishing.

## License

MIT (see LICENSE).


## v0.2 template gallery

Open the **Templates** tab to switch between Professional, Minimal, Developer and Creative. Your profile information remains intact and the selected template is saved locally. The Markdown export follows the selected template. The visual preview is GitHub-inspired, not a pixel-perfect GitHub renderer.
