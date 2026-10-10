# Code to Career issues changes and decisions

Last updated: 10 October 2026. Related files: [plan.md](plan.md), [progress.md](progress.md), [constraints.md](constraints.md).

This log distinguishes observed failures and missing information from anticipated engineering risks. A planned mitigation is not proof that a risk has been resolved. Priority P0 blocks the relevant eligibility or release gate; P1 needs resolution before its dependent feature; P2 can be resolved during its scheduled release.

## Open issues and dependencies

| ID | Type | Priority | State | Affects | Finding and next action |
| --- | --- | --- | --- | --- | --- |
| ISS-001 | Timing/eligibility uncertainty | P0 for competition claims | Open | Original submission | Source says Fri 9 Oct 10:00 am final freeze; session date is 10 Oct 2026. Year/timezone and current organizer policy need confirmation. Do not claim post-freeze work was eligible or backdate commits |
| ISS-002 | Hosted AI failure | P0 for live Statement 1 | Open | Roadmap generation/advice/discussions | Original CodeCraft works locally but hosted requests returned 403. User-selected OpenRouter free model returns valid direct output, but hosted roadmap requests returned 502. Safe failure diagnostics deployed; no hosted success claimed |
| ISS-003 | Observed tooling failure | P1 | Resolved provisioning; CLI limitation retained | Integrations | CLI fetch failed; verified official API fallback provisioned dedicated Neon/Clerk resources and connected them. Global CLI 58.4 remains outdated, temporary 63.1.2 available; upgrade recommended |
| ISS-004 | Source omission | P1 for submission | Open | Repository and Round 1 | “Deadline above” and Round 1 snapshot timestamp are not provided in this DOCX. Obtain current organizer schedule; do not invent times from the README’s “next 16 hours” wording |
| ISS-005 | Planning assumption | P1 | Open | Release estimates | Team size, actual remaining build window, target institutional scale and budget unknown. Re-estimate after R0; do not promise all releases in a hackathon day |
| ISS-006 | Architecture spike | P1 | Planned | R5/R6 | Real-time runtime, shared coordination, scheduler lifecycle and speech capabilities must be verified under deployment limits. Spike reconnect, process turnover and durable state before enabling rooms |
| ISS-007 | Data/content dependency | P1 | Planned | RD-06/RD-12 and preparation | Need reviewed references, legitimate pathway evidence, question answers and rubrics. No fabricated people, credentials, job listings or quoted transcript moments |
| ISS-008 | Pilot decisions | P2 | Open | R8 | Confirm organization retention/sharing expectations, required identity integration, support owner and operating targets with actual pilot institution before claiming enterprise readiness |
| ISS-009 | Observed access blocker | P1 | Resolved application publication | GitHub publication | Planning and application source published to requested repository using isolated writable checkout; current deployed diagnostic code `1228345`; original checkout preserved |
| ISS-011 | Repository access | P1 | Blocked by owner | Automatic GitHub builds | Personal repository collaborator can push but cannot grant Vercel GitHub App/import access; `shreyansh-devk` must connect the repository to the existing project |
| ISS-012 | Production identity prerequisite | P1 | Open | Enterprise identity | Current managed Clerk development instance works; user owns no custom domain. Full production instance requires owned domain/DNS setup |
| ISS-013 | Fresh operator login | P1 | Open | Admin demonstration | Clerk verifies stored password but normal sign-in requests password reset; preserve existing demo session and resolve reset afterward |
| ISS-014 | Workspace routing loop | P0 for demo | Resolved | Three surfaces | Role was checked after domain routing, and restricted page linked back to wrong workspace. Root and protected page now choose role domain; hosted teacher redirect 307 and authorized pages 200 passed |

ISS-001 and ISS-004 do not block producing or using the product plan. They block an honest claim that newly produced work meets the original competition schedule. ISS-002 remains open for hosted AI. ISS-003 no longer blocks provisioning; its failed CLI history is retained below.

### Observed failure evidence

The category discovery command returned these relevant failures:

```text
vercel integration categories
Vercel CLI 58.4.0 (Node.js 26.5.0)
Error: Failed to get package info: Error: EPERM: operation not permitted,
open '/Users/yash113gadia/Library/Caches/com.vercel.cli/package-updates/vercel-latest.lock'
Error: EPERM: operation not permitted,
open '/Users/yash113gadia/Library/Caches/com.vercel.cli/package-updates/vercel-latest.log'
Error: Failed to fetch integration categories: fetch failed
Exit code: 1
```

At the initial planning checkpoint, no provider installation was attempted. Subsequent implementation used the supplied AI credentials and installed the documented compatible adapter. Current official documentation was used to inform recommendations. The attempted Neon Vercel guide fetch also returned an internal error; a verified Vercel integration catalog listing supports the Neon recommendation, not a claimed successful setup.

## Anticipated engineering risks

| ID | Risk | Mitigation and proof needed | Release |
| --- | --- | --- | --- |
| RSK-001 | Extra preparation features displace the selected brief | R1 must pass all Statement 1 core checks before expansions; retain a short roadmap-first demo | R1 onward |
| RSK-002 | AI graph is invalid, generic or misleading | Schema and DAG validation, contrasting goals, source/credential review, feasibility checks and bounded repair | R1/R2 |
| RSK-003 | Replanning loses completion or evidence | Stable skill IDs, immutable revisions, explicit migration mappings, conflict checks and restore test | R1/R2 |
| RSK-004 | Teacher or company staff sees unauthorized personal content | Scoped grants, assigned cohorts, restricted DB role, audit and direct two-tenant denial tests | R1/R3 |
| RSK-005 | New feature or migration breaks the last working release | Isolated candidates, API-enforced flags, compatible migrations, core regression and documented rollback limits | Every release |
| RSK-006 | AI calls exceed budget or retry repeatedly | Estimated reservations, usage ledger, per-user/tenant limits, retry cap and quota-exhaustion flow | R0 onward |
| RSK-007 | Quiz answer leaks, duplicates or score races | Explicit payloads, hidden answer storage, unique accepted answer key, server timestamps and adversarial room tests | R5 |
| RSK-008 | Quiz speed rewards connection quality more than ability | Conservative server-observed delay adjustment, coarse bands, bounded speed bonus, multi-latency tests and honest fairness limitations | R5 |
| RSK-009 | Voice discussion is slow or interruptions fail | Real speech spike, serialized floor, cancel stale output, candidate latency measurements and interruption tests | R6 |
| RSK-010 | Feedback invents speech or overstates ability | Exact turn/quote validation, heard-audio transcript, confidence labels and observable criteria only | R4/R6 |
| RSK-011 | Graph or room is unusable on phones/keyboard | Touch and keyboard flows, companion outline/captions, large controls, accessible states and slow-device checks | R1 onward |
| RSK-012 | Product is called enterprise-ready without operational proof | Separate pilot gate, restore/failover drill, permission lifecycle, cost controls and support exercise | R8 |

These risks remain relevant to the implemented local application. Local verification narrows specific risks but does not establish production operating readiness.

## Decision log

| ID | Decision | Basis and consequence | Status |
| --- | --- | --- | --- |
| DEC-001 | Statement 1 stays primary | User instruction and source “pick one”; preparation is listed as added value | Adopted for plan |
| DEC-002 | Create four Markdown files | User listed plan, progress, issues/changes and constraints, despite saying “2–3” initially | Implemented |
| DEC-003 | Third surface is organization workspace with teacher roles | User allowed teacher or organization; organization scope also supports college leagues, cohorts and placement staff | Planning assumption, explicit in plan |
| DEC-004 | Company admin means platform operator | Distinguishes operator controls from institution controls; recruiting-company portal not assumed | Planning assumption |
| DEC-005 | One modular repository and shared identity/data contracts | Keeps three surfaces consistent and avoids premature service duplication | Implemented locally |
| DEC-006 | R1 completes the entire roadmap core | A working visualization alone misses dynamic node advice/rerouting; both are required before extra modules | Adopted release gate |
| DEC-007 | R5 is full AptiQuiz; R6 is full spoken GD | Preserve source depth and avoid claiming solo/text practice fulfills the imported real-time modules | Adopted release gates |
| DEC-008 | Last verified release remains usable during development | User’s timing-resilience requirement; use isolated candidates, flags, compatible schema and core smoke checks | Adopted delivery rule |
| DEC-009 | Enterprise objective continues through R8 | First demo is an early checkpoint; institutional controls and operating evidence remain required work | Adopted product horizon |
| DEC-010 | Managed production auth/PostgreSQL plus supplied AI service | Production adapters exist; local auth/PGlite and real CodeCraft compatibility are verified. Dedicated Neon and managed Clerk development identity connected and exercised; owned-domain production identity remains open | Partially implemented |
| DEC-011 | No fabricated pathway or outcome evidence | Honest realism requires sources and clear hypothetical labels | Adopted content rule |
| DEC-012 | Network fairness and readiness are qualified claims | Quantified design/test criteria instead of claiming perfect click-time knowledge or guaranteed employability | Adopted measurement rule |

## Change log

### CHG-001 on 10 October 2026

Created `plan.md`, `progress.md`, `issues-changes.md` and `constraints.md` from the supplied DOCX and the user’s scope. Added detailed roadmap features, three surface workflows, preparation modules, data/architecture design, release gates, verification, an enterprise pilot horizon, and original organizer constraints.

External application content was not uploaded. No provider resource was provisioned, no code was scaffolded, no repository was created or pushed, and no app was deployed. Read-only online documentation and integration discovery were consulted; discovery failed and is recorded above.

Validation status: passed local four-file checks. The Python checker exited 0 after validating file presence, local links, table columns, code fences, release/feature IDs, source hashes, paragraph bounds, issue references and unchecked application work. This is documentation verification, not application testing.

### CHG-002 on 10 October 2026

Recorded the user-authorized GitHub destination and attempted publication checks. Local folder was not a Git repository. GitHub CLI reported connection/authentication failures in the restricted shell; those checks do not establish usable credentials. The unrestricted API request was rejected by automatic approval review because shell escalation is disabled. Browser initialization returned `Browser is not available: iab`. Local Git initialization failed with `/Users/yash113gadia/code-to-career/.git: Operation not permitted` and exit code 1. No files were published and no commit was made.

### CHG-003 on 10 October 2026

Verified the user-published planning commit and repository remote. Resolved ISS-009 for the planning files, retaining CHG-002 as the historical failed attempt. Bootstrapped a pinned Next.js/React/TypeScript application with learner, organization and operator surfaces, persistent local PostgreSQL, production PostgreSQL and Clerk adapters, server permissions, same-origin input validation, quotas and additive migrations. Dedicated production resources have not been provisioned.

### CHG-004 on 10 October 2026

Implemented roadmap intake and real AI generation, graph validation/navigation, known/completed marks and workload recalculation, milestones, constraints, revisions/restore, evidence and teacher review/assignment, Today/progress, data/SVG export and explicit revocable sharing. Added a diagnostic, error notebook and practice history. Actual HTTP flows verified access isolation, optimistic conflicts, reviewed evidence, ownership, grading replay and share revocation. The source planning file remains the broader product horizon, not a list of completed features.

### CHG-005 on 10 October 2026

Implemented reusable classroom authoring with image/table payloads, reorder/edit-copy UI, immutable room questions, server-clock deadlines, per-player shuffled opaque options, atomic first-answer scoring, lobby/polling/reconnect, final topic/accuracy/speed reports, organization league and CSV export. A real 50-player local HTTP test accepted all 50 concurrent answers (518 ms batch; p50 362 ms; p95 511 ms), rejected duplicates/late answers, retained reconnect state and returned 50 final standings. This is one local scenario, not a hosted capacity or fairness benchmark. Measured report and repeatable script are included.

### CHG-006 on 10 October 2026

Stored the user-supplied credentials only in ignored server-side `.env.local` with restrictive permissions. `/v1/models` authenticated and listed the requested model. `/v1/messages` returned 404 despite the provider's Anthropic setup example; `/v1/chat/completions` returned a real response. Switched to the provider-documented OpenAI-compatible AI SDK adapter while preserving the supplied environment names. Removed the unused Anthropic adapter.

Real AI roadmap verification saved 16 payment-engineering milestones. An initial 14-node UX response mislabeled learning skills as projects. The AI prompt and acceptance validator were tightened; the final UX research plan saved 15 milestones with 11 skills, 2 concrete studies/projects and 2 roles. Both final graphs passed the career-graph validator. Real advice included a concrete project, acceptance criteria and questions. Some initial requests timed out or returned no output; bounded time/token allowances were adjusted, retries remain manual, and failures preserve existing work. Failures and attempts consume the configured per-user allowance. This is not a provider availability guarantee.

### CHG-007 on 10 October 2026

Implemented private persisted group discussions with 3–5 AI personas plus moderator, saved learner turns before generation, optimistic cancellation/pause/resume, transcript export, browser speech opt-in and interruption, and four-criterion feedback requiring exact learner-turn quotes. A real three-person AI panel and moderator returned successfully. A completed report passed all four criteria with nine exact learner quotes and three next actions. Provider failures preserved learner contributions and paused the session; another learner was denied access. A second session with five configured personas was paused during generation; its late validated response returned 409 and no AI turn was saved. Browser microphone, distinct voices and full spoken timing remain user-owned acceptance checks. Participation percentages explicitly measure text words, not speaking duration.

### CHG-008 on 10 October 2026

Added bounded browser request deduplication and a database lease for milestone guidance so duplicate revision/node requests do not spend multiple quota slots. Actual concurrent HTTP requests produced one accepted generation and one 409, with exactly one quota increment. Cached advice is included in private roadmap reads and remains available when AI generation is paused. A typecheck caught a temporary imported `Map` name collision in the browser cache; corrected to `globalThis.Map` before final checks. Added adversarial CSV-prefix escaping tests, safe usage display, a non-deploying GitHub CI workflow and project-specific agent conventions. Final unit suite now contains 17 passing tests, including production rejection of local filesystem storage.

### CHG-009 on 10 October 2026

Removed the temporary isolated-test environment override and temporary provider header file, retaining ignored server-side credentials. Prepared normal `.data/postgres` seed identities and started the app on `127.0.0.1:3000`. Actual login, workspace/page reads and a profile write returned 200; configuration reports AI ready and an unused default request allowance. No browser was launched.

Repeated rebuilds were observed in the older test-server logs. A focused investigation checked generated-type and database modification times; a normal read/write did not reproduce a rebuild loop after restarting. No speculative product change was applied. Browser hot-reload acceptance remains pending, along with the other user-owned UI checks.

### ISS-010: browser and deployment acceptance

Earlier browser automation failed with sandbox `EPERM`/browser launch errors. The user then explicitly instructed the agent not to run a browser. No browser was launched afterward. User-owned visual, keyboard, mobile and microphone tests remain pending. `npm run start -- --port 3200` also failed with `listen EPERM: operation not permitted 127.0.0.1:3200`; production HTTP could not be exercised here. A separate production-mode guard test confirmed local filesystem storage is rejected. Hosted login/database and live deployment were subsequently verified; production load/failover/restore and final PPT remain pending. See the current hosted checkpoint in progress.md. The app is not labeled enterprise-ready until these gates pass.

## Maintenance rules

For a new issue, record ID, observed evidence, affected release, owner when known, next action and resolution proof. For a change, record what changed, why, which requirement/release it affects and its verification. For a decision, distinguish a recommendation from a user-confirmed choice.

Do not close an issue because a mitigation has been written. Close it after the relevant evidence exists. If moving scope to a later release, update the plan, tracker and README consistently, and retain the current working release.


### CHG-010 on 10 October 2026

Saved the verified application locally as commit `9977321`, with 85 changed files. Git staging and commit succeeded after the user had initialized the repository. No supplied token or private environment/data file was staged; the client-bundle secret scan returned zero matches. Normal local server is running on port 3000 with AI configuration ready and an unused 10-request allowance. No new Git push or deployment was performed. Publishing this application checkpoint remains a separate outward action under the user's operating standards.

### CHG-011 on 10 October 2026

Published the application to the requested GitHub repository and deployed a dedicated Vercel project. Provisioned free dedicated Neon PostgreSQL and Clerk development identity resources, applied 29 compatible additive statements after deploying their readers/writers, and exercised real hosted sign-in and database workflows. Connected three HTTPS Vercel domains with server-enforced origin and role rules. No paid upgrades or fabricated production identity were introduced. Git automatic builds remain blocked by personal repository-owner permission, separately from successful source publication.

### CHG-012 on 10 October 2026

Added the user-selected OpenRouter free model adapter. The model does not advertise native structured-output response format, so the SDK adapter places the JSON Schema in the prompt and retains schema/career-graph validation. Direct exact request returned 200 and a valid graph; full SDK response replay passed. Hosted calls returned 502, so this is an observed open failure, not a completed hosted AI integration. Both API keys remain ignored/server-side; a client-bundle scan found zero occurrences.

### CHG-013 on 10 October 2026

Fixed signed-in root and protected-page routing to choose the account's role, with sign-in/signup returning through the root. The prior restricted page could loop an admin/teacher back to the learner workspace. Twenty tests, typecheck and build passed; published/deployed `b47555d`, then hosted teacher-on-learner redirect 307 and authorized learner/teacher pages 200 passed. API permissions remain enforced.

### CHG-014 on 10 October 2026

Added production AI diagnostics limited to error names/codes, HTTP status, finish label and output length. Known graph errors receive specific audit categories; prompts, provider payloads, credentials and raw error messages are excluded. New adversarial diagnostic tests passed, bringing the suite to 22 tests. Published/deployed `1228345` as READY and started a fresh authenticated hosted generation check. Actual failure/success is recorded in progress.md, not inferred from the deployment build.

### CHG-015 on 10 October 2026

The hosted failure was confirmed from redacted production diagnostics and audit as disconnected milestones, not invalid credentials. Tightened the dependency prompt and added one semantic graph repair, with no validation bypass, unchanged total timeout, quota charge and no further retries. New tests cover successful first output, repaired connectivity, second invalid output and quota denial. One initial test removed an independent role, which the existing validator permits; corrected the fixture to disconnect a project and all 25 tests passed. Published/deployed `2bd72b8`; live generation still requires actual HTTP verification.
