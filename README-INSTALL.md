# DevProfile Studio v0.4.3 — Preview polish

Adds a GitHub-style Overview / Repositories navigation bar above the GitHub-layout README. The Repositories item opens the connected account's actual GitHub repositories in a new tab (it does not pretend to show local repository content). With no connected account, it is disabled.

Empty About, Skills, Projects, Stats, and Connect sections are omitted from both the visual preview and exported Markdown. Stats requires a GitHub username; Connect requires a username or a valid LinkedIn URL. Editor fields and section toggles remain unchanged.

Copy `app/page.tsx`, `app/globals.css`, and `lib/profile.ts` into your project. Leave your existing GitHub Connect components and other files in place. Run `npm run build` and `npm run dev` locally, then verify the two preview modes and Markdown export.
