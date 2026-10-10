<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Pathfinder project conventions

- Statement 1 is primary. Read `README.md`, `progress.md`, `issues-changes.md` and `constraints.md` before changing release scope.
- The user owns browser testing. Do not launch browsers or browser automation unless the user changes that instruction.
- Commands: `npm run check`, `npm test`, `npm run build`. Browser tests and the isolated 50-player load script are provided for user-run verification.
- Never expose or commit `.env*` (except `.env.example`), `.data`, cookies or provider headers. AI credentials stay server-side.
- Local PGlite/development identity require explicit non-production mode. Production requires Clerk and hosted PostgreSQL; do not add an identity/storage fallback.
- Enforce ownership and organization membership in server services, not only layouts. Keep operator responses redacted and private roadmaps inaccessible to operators.
- Schema changes must be additive. Use immutable roadmap revisions, immutable classroom question snapshots and optimistic version checks.
- New modules must preserve saved roadmap workflows. Flags pause new activity without deleting existing data.
- Record measured evidence and remaining acceptance honestly. Do not call browser speech, managed services, deployment or enterprise operations verified from a local build.
- Outward actions such as a new Git push or deployment require confirmation under the user's operating standards. Prepare and verify the concrete result before asking.
