# Code2Career Pathfinder

Live demo: [Learner](https://code2career-pathfinder.vercel.app/app), [Admin](https://code2career-admin.vercel.app/admin), [Teacher/organization](https://code2career-organization.vercel.app/org). Source is published in this repository. Managed Neon PostgreSQL and a Clerk development instance are connected. Hosted AI roadmap generation currently returns 502 and is under investigation; saved manual roadmaps remain usable. Demo passwords are distributed privately, never committed.

## 1. What it does and the selected problem statement

Pathfinder turns a specific career goal into a connected learning roadmap. Statement 1 is the primary brief: skills, projects, intermediate roles, the target role, effort estimates, an interactive dependency graph, milestone guidance and progress that changes downstream availability. Preparation incorporates classroom quizzes from Statement 3 and group discussions from Statement 2.

The application has three authenticated surfaces: learner (`/app`), teacher or organization owner (`/org`), and platform operator (`/admin`). A learner’s private roadmap is not readable by the platform operator. Teachers receive only their assigned learners; organization owners receive their own organization’s roster and evidence. Public roadmap snapshots require explicit learner consent and can be revoked.

## 2. Done, left and the plan for the next 16 hours

Implemented: career intake, AI roadmap integration, validated dependency graphs, milestone guidance, known/completed marks, timeline recalculation, editable milestones, immutable revisions and restore, evidence review, teacher assignments, export and revocable sharing. Also implemented: a server-graded diagnostic, error notebook, reusable classroom question authoring with image/table support and reordering, timed rooms, stable per-player shuffled options, leaderboard, final topic/accuracy/speed report, organization league, and persisted AI discussion transcripts with exact-quote feedback validation. Browser speech recognition and synthesis are optional, with permission, review and interruption controls.

Verified evidence and remaining acceptance checks are maintained in [progress.md](progress.md). Hosted sign-in, PostgreSQL writes, saved roadmap ownership/conflicts, teacher assignments/reviews, diagnostics and a classroom quiz flow passed actual HTTP checks. This is a deployed demo with development identity, not a verified enterprise release. Hosted AI reliability, production Clerk identity on an owned domain, GitHub automatic builds, hosted 50-player/restore/failover drills, SSO/SCIM, institutional retention policy, a final PPT and broader R7/R8 features remain open. The user owns browser testing, including graph interaction, mobile layout, accessibility and microphone/voice behavior.

The next 16 hours are a planning window, not a measured completion estimate or an organizer deadline: repair hosted AI generation; finish the user’s browser review; have the GitHub repository owner connect the Vercel GitHub App; exercise hosted load/restore checks; prepare the required PPT and freeze a tested release before further enterprise work. The original document’s final freeze date conflicts with this session date; eligibility needs organizer confirmation.

## 3. Architecture and why

Next.js 16 App Router and React provide one repository with role-protected layouts. Node route handlers enforce authentication, organization membership, resource ownership, input bounds and same-origin mutations. Zod validates API and AI output. React Flow renders the graph; a milestone list provides a second navigation path. The learner’s weekly time budget is shared across work, so parallel prerequisites do not create an unrealistically short workload estimate.

PostgreSQL stores roadmaps, immutable revisions, reviews, assignments, accepted answers, quotas and discussion transcripts. Local development uses persistent PGlite, explicitly restricted to non-production mode. Production requires `DATABASE_URL` and Clerk. Browser input cannot assign staff roles. Production without managed services fails closed; local development accounts and filesystem storage are never a production fallback.

Classroom timing derives from PostgreSQL’s clock, a saved start time and immutable question durations. Answers are accepted atomically under a room lock and unique player/question key. There is no process-local countdown or scheduler to lose on restart. Clients poll and restore server state on reconnect. A correct answer earns 1,000 plus a bounded 0–500 speed bonus. The bonus measures server arrival time and is affected by network delay; it does not prove learner ability.

AI SDK 7 calls the configured provider only from the server. `OPENROUTER_API_KEY` takes priority, using the user-selected `nvidia/nemotron-3-ultra-550b-a55b:free` model. Its adapter requests JSON through the prompt and validates it through the schema and career-graph rules; malformed output is rejected. Failure diagnostics contain error metadata, never provider bodies, prompts or credentials. Supplied `ANTHROPIC_*` names select CodeCraft’s OpenAI-compatible chat API, because its `/messages` endpoint returned 404 during verification. [CodeCraft documents this adapter](https://codecraftapi.com/docs/coding-agents). Optional AI Gateway configuration is also supported. AI requests have output limits, no automatic HTTP retries, a two-minute total timeout and a default 10-request per-user 24-hour quota (the hosted demo uses 20). A schema-valid career graph with invalid dependencies receives at most one model repair, charged against the same quota; both outputs must pass validation before saving. Existing valid work survives provider failures. Feature flags pause all new AI generation, solo practice, classroom rooms and discussion turns; cached work remains readable.

Discussion contributions are saved before generation. Pausing invalidates an in-flight generation version so a late response cannot re-enter the session. Feedback must cite an exact substring of a real learner turn for each criterion. Participation percentages measure text words, not speaking time. Browser-provided voices and speech services vary; separate voices for every participant are available only when the browser supplies enough voices. This is turn-based practice, not a verified full-duplex audio arena.

Schema migration is additive and shared by local and hosted databases. Preserve the last tested Git release, apply a candidate migration in isolation, and keep incomplete features disabled. Do not migrate a production database or promote a deployment without a reviewed release and a rollback/restore plan.

## 4. What was added beyond the brief

- Organization-scoped teacher review, assignments and a separate operator directory/role-management surface.
- Immutable history, conflict detection, structure restore with matching progress preserved, time-budget changes, editable milestones and Today’s work.
- Revocable public graph snapshots, SVG/data exports, private evidence library and separate reviewed-evidence counts.
- Practice history and an error notebook with learner revision notes.
- Reusable question sets and immutable room copies, author explanations, tables and image descriptions, CSV standings export with formula-prefix protection.
- Persisted discussions, pause/cancel/resume, transcript export, evidence-linked coaching and honest speech capability disclosure.
- Server-enforced quotas, release controls, redacted audit events and automated security/domain tests.

The full product roadmap remains in [plan.md](plan.md). Changes, observed failures and decisions are tracked in [issues-changes.md](issues-changes.md). Organizer constraints are recorded in [constraints.md](constraints.md).

## 5. How to run, test logins and live URL

Use Node.js 22 or later; this workspace was verified with Node.js 26.5.0. For a new checkout:

```sh
npm ci
cp .env.example .env.local
```

Edit `.env.local` locally, including a development password of at least 12 characters. Configure the supplied AI token there, never in a browser variable, source file or commit. All `.env*` files except `.env.example` are ignored. Then:

```sh
npm run seed:dev
npm run dev
```

Open **http://127.0.0.1:3000** yourself. Development usernames are `learner`, `teacher`, `admin`, `learner-two`, and `other-teacher`. All use `DEV_ACCOUNT_PASSWORD`; the sample default is `pathfinder-local-2026`. These accounts are labeled local development. The second learner and teacher belong to a separate organization. No fake AI roadmap is seeded.

For another hosted environment, set `ENABLE_LOCAL_AUTH=false`, provision Clerk and hosted PostgreSQL, configure `APP_ORIGIN` and `APP_ORIGINS` to the intended public HTTPS origins, set `USER_APP_URL`, `ADMIN_APP_URL` and `ORG_APP_URL` for three-domain routing, and set `PLATFORM_ADMIN_IDS` to explicitly authorized Clerk user IDs. Deploy compatible code to an isolated preview first, then run `npm run db:migrate` against its intended database and verify it before enabling the new features or promoting traffic. Upgrade the global Vercel CLI before deployment with `npm i -g vercel@latest` (the workspace global CLI was 58.4.0; a temporary 63.1.2 installation was checked). New Clerk accounts default to learners and can be assigned to an organization by an authorized operator.

```sh
npm run check
npm test
npm run build
npm audit --omit=dev
```

Browser tests are supplied for the user to run with an installed Playwright browser:

```sh
npx playwright install chromium
npm run test:e2e
```

The test runner uses isolated `.data/e2e` and clears AI credentials to avoid billable generation. Stop an existing development server before starting that suite. Do not point tests at production. Backend workflows were exercised with real local HTTP requests in this session; the Playwright/browser suite has not passed here because this environment denied its browser/network operations.

To repeat the 50-player HTTP load test, seed an isolated database and run its server in a separate terminal:

```sh
ENABLE_LOCAL_AUTH=true LOCAL_DATABASE_PATH=.data/e2e PATHFINDER_LOAD_USERS=true npm run seed:dev
ENABLE_LOCAL_AUTH=true LOCAL_DATABASE_PATH=.data/e2e npm run dev -- --port 3100
```

```sh
npm run test:load
```

The script accepts only a loopback HTTP server, uses synthetic accounts and writes a measured report. [The recorded local 50-player result](tests/reports/quiz-load-local.json) accepted 50/50 simultaneous answers with duplicate/late denial and persisted final standings. It is a local concurrency smoke test, not a production capacity benchmark.

**Live URLs:** [Learner](https://code2career-pathfinder.vercel.app/app), [Admin](https://code2career-admin.vercel.app/admin), [Teacher/organization](https://code2career-organization.vercel.app/org). Signed-in pages route accounts to their authorized workspace. New accounts are learners by default; teachers must be assigned by the operator. Existing evaluation learner/teacher credentials are provided privately. The operator account currently requests a password reset on a fresh login; retain the existing session during the demo. Automatic GitHub builds remain blocked on the personal repository owner granting the Vercel GitHub App access and connecting the repository.

## 6. Tools and AI disclosure

Built with Next.js, React, TypeScript, React Flow, Zod, PostgreSQL/PGlite, Clerk integration code, AI SDK, Lucide and Playwright/Node test tooling. Dependencies are pinned in `package-lock.json`. Codex assisted planning, implementation and backend verification. Roadmaps, milestone advice, discussion personas and feedback use the configured AI service; the six diagnostic questions were authored and reviewed in the repository, not falsely labeled AI-generated.

No browsing tool is connected to the application’s AI. Resource searches are suggestions, not verified links or citations. No alumni, hiring outcome, accreditation or guaranteed placement is invented. Browser transcription may send audio to the browser’s speech service after consent; review the transcript before sending it to the configured AI provider. Provider responses and credentials are excluded from application audit logs.

## 7. Who it is for

Learners who need a specific career path and a manageable next step; teachers who want to assign work and review evidence; organizations running practice cohorts; and platform operators responsible for access and release controls. Progress and practice scores support reflection. They do not certify professional competence or guarantee employment.
