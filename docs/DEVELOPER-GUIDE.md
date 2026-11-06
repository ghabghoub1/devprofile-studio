# DevProfile Studio — Developer Guide

> A practical introduction to running, understanding, and contributing to the repository. This guide describes the known v0.4.3 architecture; verify file paths against the checked-out branch before refactoring.

## 1. Prerequisites

Install Git, Node.js, and npm. Use a Node.js version supported by the project's `package.json` and Next.js version. Check `node --version` and `npm --version` before proceeding.

## 2. Clone the repository

```powershell
git clone https://github.com/ghabghoub1/devprofile-studio.git
cd devprofile-studio
git fetch --tags
```

For the known stable v0.4.3 snapshot, check out its tag in a detached HEAD:

```powershell
git checkout v0.4.3
```

To contribute new work, use a development branch instead of committing on a tag.

## 3. Install and run

```powershell
npm install
npm run dev
```

Open the local URL printed by Next.js (usually `http://localhost:3000`).

## 4. Understand the main files

```text
app/
  page.tsx                       Main editor state and UI orchestration
  layout.tsx                     Root Next.js layout
  globals.css                    Application styling
components/
  github/
    GitHubConnect.tsx            GitHub account lookup and import UI
    GitHubProfilePreview.tsx     GitHub-inspired profile preview
lib/
  github.ts                      Public GitHub API requests
  profile.ts                     Profile model and Markdown generation
README-INSTALL.md                Existing installation notes
```

Additional files may exist. This map is a starting point, not a complete inventory.

## 5. Follow the data flow

```text
Manual editor input ──────────────┐
                                  ├─> Profile state ─> Preview
GitHub public API ─> Smart Import ┘          │
                                            ├─> Local browser storage
                                            └─> Markdown generation ─> README / ZIP export
```

### Key responsibilities

1. **`app/page.tsx`** manages editor interaction, active views, and profile state.
2. **`lib/github.ts`** retrieves public GitHub user data.
3. **`components/github/GitHubConnect.tsx`** lets the user choose and review imported fields.
4. **`lib/profile.ts`** defines profile data and generates Markdown.
5. **`components/github/GitHubProfilePreview.tsx`** presents the GitHub-inspired preview.
6. **`app/globals.css`** provides styling, including Smart Import styles that must be preserved during cleanup.

The current editor stores profile data under the browser local-storage key `devprofile-v1`. If changing the data model, plan a migration rather than silently discarding saved profiles.

## 6. Project field format (compatibility requirement)

The Projects field currently uses newline-delimited entries with an optional `|` separator:

```text
Project Name
Project Name | Optional description
```

When changing parsing, preview rendering, or Markdown export, preserve these rules:

- One nonempty line represents one project.
- Text before the first `|` is the project name.
- Text after the first `|` is an optional description.
- No description means **no description paragraph**, not placeholder copy.
- An empty Projects field should not produce an empty Featured Projects section.

Explain this format in the editor help text and user documentation.

## 7. Validate changes

```powershell
npm run build
```

The build should pass Next.js compilation, TypeScript checks, and static page generation. Also perform manual checks:

- GitHub Connect fetches a public account.
- Smart Import changes only selected fields.
- Clear Profile and Reset to Example behave correctly.
- README Only and GitHub Layout previews render.
- Empty sections stay hidden.
- Projects render correctly with and without descriptions.
- README and ZIP exports contain expected content.
- Existing browser-saved profiles still load.

If the repository defines lint or test scripts, run those as well; inspect `package.json` rather than assuming their names.

## 8. Work safely on v0.4.4

Start from the development branch and create a feature branch:

```powershell
git switch develop/v0.4
git pull origin develop/v0.4
git switch -c develop/v0.4.4
```

Before changing architecture, commit documentation separately. Then refactor one area at a time, running the build and checking key UI workflows after each step. Avoid replacing `globals.css` wholesale: preserve selectors used by GitHub Connect and Smart Import.

## 9. Commit and open a pull request

```powershell
git status
git add docs README.md
git commit -m "docs: add user and developer guides"
git push -u origin develop/v0.4.4
```

The `git add docs README.md` command assumes you have also updated `README.md`. If not, use `git add docs`.

Open a pull request targeting the intended integration branch, describe the change, and include build/test results. Do not create a version tag until the release is ready.

## 10. Next refactoring targets

- Extract editor panels from `app/page.tsx` incrementally.
- Keep profile types and Markdown rules centralized.
- Add unit tests for project parsing, Markdown generation, and Smart Import selection.
- Organize CSS without removing existing component selectors.
- Improve keyboard accessibility, error handling, and mobile layout.

## Related documentation

- [User Guide](USER-GUIDE.md)
