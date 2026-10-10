# Code to Career progress tracker

Last updated: 10 October 2026. Primary brief: Statement 1. Product plan: [plan.md](plan.md). Constraints: [constraints.md](constraints.md). Issues and decisions: [issues-changes.md](issues-changes.md).

## Current verified state

Application source is published on GitHub and three Vercel domains are live. Managed Neon PostgreSQL and a managed Clerk development instance are connected to the deployment. Real authenticated HTTP checks passed for saved roadmap and preparation workflows. Hosted AI generation was repaired after production diagnostics identified disconnected milestones. A real AI roadmap, readback and milestone guidance now pass live HTTP checks; a second exact-role check passed under the primary evaluation learner. The user owns all browser testing. Personal quizzes and the learner dashboard are published as `82faf53`; their hosted schema and authenticated saved-attempt flow are verified. Roadmap reading is published as `477b1ee`, with hosted build, authenticated saved-roadmap reads and deployed client assets verified; browser interaction remains user-owned.

| Item | State | Evidence or limitation |
| --- | --- | --- |
| Plan and original constraints | Verified documentation | Source was inspected; four requested Markdown files were created and checked |
| GitHub application publication | Published | Requested repository `shreyansh-devk/code2career_pathfinder`; isolated publication checkout preserves original history |
| Three hosted domains | Live verified HTTP | Learner `code2career-pathfinder.vercel.app`, admin `code2career-admin.vercel.app`, organization `code2career-organization.vercel.app`; HTTPS sign-in pages return 200 |
| Managed PostgreSQL | Live verified | Dedicated Neon resource in Singapore; 29 additive migration statements succeeded after compatible code deployed; hosted writes/readback passed |
| Managed identity | Live verified development instance | Real Clerk password sign-ins and origin-bound session tokens passed; local production login endpoint returns 404; full production identity still needs an owned domain |
| Saved roadmap workflow | Live verified backend | Manual create 201, owner read 200, mark 200, stale revision 409; saved data persists |
| Hosted access boundaries | Live verified backend | Other learner/operator private reads 404, learner admin 403, anonymous 401, cross-origin mutation 403 |
| Teacher and organizations | Live verified backend | Operator created organization/assigned membership; teacher reviewed evidence and assigned work; learner readback contains approval and assignment; foreign organization denied 404 |
| Solo preparation | Live verified backend | Start 201, submit 200; scored attempt persisted and returned in learner workspace |
| Classroom flow | Live verified backend | Set/room/join/start and scoring passed, answers hidden before reveal, manual stop 200; cross-organization join denied 404; answer after close denied 409 |
| 50-player concurrency | Verified locally only | 50/50 accepted with duplicate/late denial and final standings; hosted load/fairness/turnover not tested |
| AI roadmap, guidance and discussions | Verified locally with original provider | Real local role-specific graphs, milestone guidance, panel and exact-quote feedback passed; this is not proof of current hosted AI operation |
| Selected OpenRouter free model | Live generation and guidance verified | Hosted 201 in 48.196 s saved 16 milestones (12 skills, 2 projects, 2 roles); schema/career validator and owner readback passed; milestone guidance 200 in 11.079 s and persisted in readback |
| Workspace restriction fix | Live verified backend | Teacher on learner `/app` receives 307 to organization `/org`; learner and teacher authorized pages return 200 with no restricted/error screen |
| Operator fresh sign-in | Open issue | Stored password verified by Clerk backend, but normal fresh sign-in reports password reset required; existing browser session was retained |
| Code checks | Passed | Quiz/dashboard release: typecheck, 33 tests and hosted build passed. Local roadmap reading: typecheck, 37 tests and build passed; browser review remains user-owned |
| Personal quizzes and dashboard | Published; saved flow verified live | `82faf53`; three additive quiz tables, owner reads, draft saving, answer-key concealment and deterministic scoring passed; current hosted AI quiz generation was not repeated |
| Roadmap reading | Published; hosted reads and assets verified | `477b1ee`; phase views, line grid, compact layout and focus control are served on the live site. Browser phase/zoom/mobile/keyboard interaction remains pending |
| GitHub automatic builds | Blocked by repository-owner access | Collaborator has push permission, no admin/owner access; Vercel GitHub App and project Git connection remain pending |
| Browser, speech, mobile and accessibility | User-owned, pending | No browser launched following instruction; no visual/speech pass claimed |
| Enterprise operations and final presentation | Pending | Owned-domain production identity, SSO/SCIM, retention, restore/failover, hosted workload and final PPT remain open |

Backend evidence does not certify browser behavior, enterprise readiness or hackathon eligibility. Current application code checkpoint: `2bd72b8`; deployed source/docs checkpoint `1f5b65a` as `dpl_A3PjndkyNeJNzZ1hM1U4z7xmNtft` (READY), including the hosted 20-request daily allowance. The previous routing release is `b47555d`. Deployment rollback does not undo database writes.

## Status convention

- **Planned:** scoped but not started.
- **In progress:** work exists, acceptance not yet satisfied.
- **Blocked:** name the dependency and owner in the issue log.
- **Verified locally:** relevant real flows/checks passed in a local environment, with evidence.
- **Verified candidate:** candidate deployment and relevant flows passed, with evidence.
- **Live verified:** authorized promotion occurred and live checks passed against the recorded release.
- **Deferred:** explicitly moved to a later release, with reason and impact.

Use unchecked boxes until acceptance passes. Do not label a release complete from typechecking, a screenshot, or a mocked provider response alone.

## Release ledger

| Release | Scope | State | Dependency | Accepted evidence |
| --- | --- | --- | --- | --- |
| R0 | Real integration and environment readiness | Hosted demo integrations verified | Owned-domain production identity and environment isolation | Real Clerk sign-in, Neon writes and hosted OpenRouter generation |
| R1 | Full Statement 1 core | Local/hosted backend verified; UI pending | User browser/mobile review | Two distinct hosted AI goals/guidance, persisted readback and known-mark effort change |
| R2 | Roadmap personalization and depth | Partially implemented | Alternative-path/source depth and UI acceptance | Constraints, edit/revision/restore, share/revoke and exports |
| R3 | Three functional surfaces | Hosted backend verified subset | Owner/support lifecycle, fresh operator login and browser review | Hosted scoped reviews, assignments, operator controls and tenant denial |
| R4 | Solo preparation and evidence loop | Hosted backend verified subset | Role-specific interview depth and UI acceptance | Hosted diagnostic start/submit, saved attempt and teacher assignment |
| R5 | Full multiplayer AptiQuiz | Local load and hosted small flow verified | Hosted 50-player/turnover, latency profiles and UI acceptance | Local concurrency plus hosted author/join/start/answer/stop and tenant denial |
| R6 | Full spoken GD Arena | Text backend verified; speech pending | User microphone/voice tests, closing/timer depth and deployed latency | Real AI panel, exact-quote feedback, transcript persistence and failure recovery |
| R7 | Advanced career and preparation features | Planned | Relevant R4–R6 modules | None |
| R8 | Enterprise institutional pilot | Planned | R3–R7 plus operating controls | None |

All dependency references indicate implementation order, not completed work. R5 and R6 add independent capabilities but both must preserve the roadmap service.

## Planning checkpoint

- [x] Read the supplied DOCX and inspect its embedded image.
- [x] Extract Statement 1’s core and expected behavior.
- [x] Map Statement 2’s voice, feedback and recovery requirements into preparation.
- [x] Map Statement 3’s authoring, real-time, fairness, reconnect and 50-player requirements into preparation.
- [x] Define user, company admin and organization/teacher workflows.
- [x] Define staged functional releases and migration/rollback rules.
- [x] Define an enterprise pilot beyond the first demo.
- [x] Record the source deadline conflict, unspecified deadlines and unverified credentials.
- [x] Validate all four files and record the result below.

## R0 readiness checklist

- [ ] Reconcile the original event dates if an eligible submission is still intended; audit repository creation and commit timestamps.
- [ ] Confirm team capacity, current milestone deadline and resource budget.
- [ ] Upgrade/check Vercel CLI and select a supported pinned runtime/package set.
- [ ] Discover integrations successfully and record chosen resources without exposing secret values.
- [ ] Provision authorized identity, database and AI resources; isolate development/test/live environments.
- [ ] Exercise real login, scoped database read/write and one bounded AI call.
- [x] Define secret handling, ignored files, `.env.example`, setup and environment verification for local development; production secrets/resources remain separate.
- [ ] Confirm deployment feasibility before committing to R5/R6 transport and speech choices.

## R1 complete roadmap checklist

- [ ] RD-01: exact-role intake and safe validation work through the UI.
- [ ] RD-02: real AI response creates a validated graph with skills, phases, intermediate roles and timeline.
- [ ] RD-03: zoom, pan and clicked milestones work on desktop and phone.
- [ ] RD-04: a click generates target-specific actionable advice through the real AI backend.
- [ ] RD-05: known-skill update changes downstream availability and remaining work; failure does not erase the valid roadmap.
- [ ] RD-06: resources and claims are supported or clearly labeled unverified; no fabricated credentials.
- [ ] RD-09: basic progress saves and survives refresh and a new session.
- [ ] Exercise two distinct exact-role inputs and inspect relevance, not just JSON validity.
- [ ] Exercise malformed input, invalid graph, provider outage, retries and concurrent changes.
- [x] Exercise another user’s direct API request and verify denial.
- [ ] Exercise keyboard navigation, control labels, contrast and mobile layout.
- [ ] Record build and actual browser-flow evidence, then preserve the release revision.

## R2 roadmap depth checklist

- [ ] RD-07/RD-08: baseline and time/budget constraints lead to a feasible schedule or an honest alternative.
- [ ] RD-10/RD-11: alternative paths and role comparison use consistent skill mappings.
- [ ] RD-12: genuine pathway sources or explicitly illustrative examples; no invented alumni outcomes.
- [ ] RD-13: private-by-default sharing, revocation and readable image export are exercised.
- [ ] RD-14/RD-17: Today view, revision differences, restore and preservation of evidence are exercised.
- [ ] Progress, sharing and revisions handle simultaneous edits safely.
- [ ] R1 core regression passes before release promotion.

## R3 three-surface checklist

- [ ] Organization membership, cohort assignment and staff permissions are server-enforced.
- [ ] Teacher assigns work, reviews evidence and comments on an authorized student roadmap.
- [ ] Organization owner manages own membership and sees accurate scoped reports.
- [ ] Company admin reviews content, inspects redacted failures and manages quotas/flags.
- [ ] Scoped support access expires and creates audit records.
- [ ] Two tenants and a standalone learner remain isolated in APIs, files, channels and cached responses.
- [ ] Removing a staff permission prevents further reads, writes and exports.
- [ ] Learner/teacher/admin actual flows and the R1 core pass.

## R4 preparation checklist

- [ ] PR-01/PR-02: diagnostic and timed practice have reviewed answers and explanations.
- [ ] PR-03: error notebook creates a usable revision task.
- [ ] PR-04: skill-specific interview practice has rubric-linked feedback.
- [ ] PR-08/PR-09: report, teacher assignment and attempt history work end to end.
- [ ] Results generate relevant roadmap recommendations without falsely verifying unrelated skills.
- [ ] Attempt versions, answer protection and owner checks are exercised.
- [ ] R1 and relevant three-surface regression pass.

## R5 AptiQuiz checklist

- [ ] AQ-01/AQ-02: reusable authoring sets, images/tables, host room, join code and lobby work.
- [ ] AQ-03/AQ-04: authoritative timing, score rules and reveal sequencing work.
- [ ] AQ-05/AQ-06: final report and organization/player period league standings work.
- [x] AQ-07: backend reconnect retains identity, accepted answers, score and current question; UI reconnect pending user review.
- [x] AQ-08: backend shuffled options, no premature answer exposure and late/duplicate denial verified.
- [ ] Fairness design is tested across latency profiles and its limits are explained in README.
- [x] AQ-09: `scripts/load-quiz.mjs` is provided; actual local 50-player HTTP results were recorded by the tool orchestrator. The standalone script has not been run here.
- [ ] Host disconnect, referee restart, cross-instance events and deployment turnover are exercised.
- [ ] AQ-10: scoped faculty reporting/export and sanitized spectator flow work.
- [ ] All enabled room features and the roadmap core pass before enabling the module.

## R6 GD Arena checklist

- [ ] GD-01: topic setup and 3–5 distinct AI panelists plus moderator work.
- [ ] GD-02: real microphone, live transcription and audible AI replies work.
- [ ] GD-03/GD-04: pauses, interruption cancellation, panel-to-panel turns, timer and closing round work.
- [ ] GD-05: report contains validated exact transcript evidence and speaking distribution.
- [ ] GD-06: denied microphone, connection loss, provider failure and explicit AI labeling are exercised.
- [ ] GD-10: captions, adjustable patience, output/mute controls and keyboard access work.
- [ ] Raw-audio default, transcript policy, opt-in and deletion behavior are verified.
- [ ] Response delay is measured on the candidate; test browsers/devices and conditions are recorded.
- [ ] Roadmap recommendations preserve learner control and the R1 core still passes.

## R7 and R8 completion checklist

- [ ] R7: project evidence, role-specific portfolio/resume suggestions and application planning work without invented experience.
- [ ] R7: mentoring, opted-in reminders and evidence-based readiness dimensions work.
- [ ] R7: quiz teams/seasons and GD variants, coaching/replay and human guests pass their own gates.
- [ ] R7: opportunity sources are current and code execution, if enabled, is actually isolated.
- [ ] R8: agreed enterprise identity, staff authentication and access lifecycle are exercised.
- [ ] R8: backup restoration, retention/deletion and tenant exports are exercised in an isolated environment.
- [ ] R8: room failover, concurrency and quota behavior pass the agreed workload.
- [ ] R8: monitoring, alerting and an incident/support drill work with real services.
- [ ] R8: proposed availability, performance and recovery targets have measured evidence or explicit deviations.
- [ ] R8: institutional integration and billing, if included, use provisioned services and verified entitlement rules.
- [ ] R8: pilot feedback, operational ownership, known limitations and final delivery evidence are recorded.

## Release evidence record template

For each promoted release, append:

```text
Release and date:
Commit and release tag:
Environment and live/candidate URL:
Migration versions and compatibility notes:
Enabled flags and tenant cohort:
Real integrations exercised:
Commands, relevant results and evidence paths:
Browser flows, roles, devices and failure cases exercised:
Load/fairness/voice measurements where applicable:
Known failures, exclusions and open issues:
Promotion authorization and live verification:
Rollback target or forward-repair procedure:
```

Do not paste environment values, private student data or credentials into evidence. Redact output before storing it.

## Session verification log

| ID | Date | Check | Result |
| --- | --- | --- | --- |
| VER-001 | 2026-10-10 | Read provided DOCX with ZIP/XML extraction | Passed; 159 main-document paragraphs counted, content/table/header/footer read, no tracked insertions/deletions or substantive comments |
| VER-002 | 2026-10-10 | View embedded source image | Passed; organizer logo, no additional deadline text |
| VER-003 | 2026-10-10 | `vercel --version` | Passed; installed version 58.4.0 |
| VER-004 | 2026-10-10 | `vercel integration categories` | Failed; exited 1, restricted cache write and integration fetch failure |
| VER-005 | 2026-10-10 | Official architecture references | Read relevant Next.js, React Flow, Clerk, Vercel and PostgreSQL docs; recommendations only; Neon guide fetch failed, catalog listing used instead |
| VER-006 | 2026-10-10 | Four-file consistency checks | Passed; Python check exited 0, local links/table columns/fences valid, R0–R8 and all four feature catalogues complete, hashes/reference bounds match, application work remains unchecked |
| VER-007 | 2026-10-10 | Initial requested GitHub publication | Failed in the restricted environment; historical evidence in CHG-002. Later user-published planning commit verified, see VER-008 |
| VER-008 | 2026-10-10 | Planning repository confirmation | Local main, origin and remote main matched `b81b4f6eadfacea3ae40d4c3507a36ba8ccf2476` |
| VER-009 | 2026-10-10 | Local actual HTTP core/security workflows | Ownership/role/tenant denial, optimistic 200/409 conflict, review/assignment, share revoke, grading replay and staff revocation passed |
| VER-010 | 2026-10-10 | Real AI workflows | Distinct payment engineering and accessible-finance UX research roadmaps, milestone guidance, 3 AI personas plus moderator, 4 feedback criteria and 9 exact quotes validated |
| VER-011 | 2026-10-10 | 50-player actual HTTP concurrency | 50/50 accepted; 518 ms batch, p50 362 ms, p95 511 ms; duplicate/late 409; 50 final standings. Local environment only |
| VER-012 | 2026-10-10 | Local checks | Typecheck/build passed; 17 unit tests passed; production dependency audit 0 known vulnerabilities |
| VER-014 | 2026-10-10 | Advice deduplication and cache | Concurrent uncached request returned 409; exactly one AI quota slot consumed; generated result saved and cached advice remains readable with AI paused |
| VER-015 | 2026-10-10 | Cancellation with five configured personas | In-flight round cancelled with version increment; late validated response returned 409; only learner contribution retained |
| VER-013 | 2026-10-10 | Browser/speech acceptance | Pending user review; prior automation failed with EPERM. No browser launched after user instruction |

## Local handoff

Normal development server: **http://127.0.0.1:3300**, using Webpack after the refresh-loop mitigation recorded below. Local seed accounts are prepared in `.data/postgres`, with no fake roadmap output. Supplied AI configuration is present server-side. The earlier unused 10-request allowance observation was a checkpoint, not a guarantee of current remaining usage. Isolated verification data remains in ignored `.data/e2e`; temporary test environment overrides and provider header files were removed.

A burst of repeated development rebuilds was observed in the older test-server logs. It was not reproduced after the clean normal restart with actual HTTP page reads, API reads and a profile write. File checks showed the write changed only PostgreSQL WAL, not generated route types. No unverified watcher fix was applied; browser HMR behavior remains part of the user-owned acceptance review.

## Next executable step

Finish the user-owned browser review. The user can demonstrate saved AI/manual roadmap, teacher and preparation workflows now. Repository owner must connect Vercel for automatic builds. Resolve operator password reset without disrupting the active demo session, then complete browser and operating acceptance. The latest instruction requests local UI changes only and explicitly prohibits pushing them; these changes are not authorized for publication or deployment. Paid upgrades remain disabled. Competition timing still needs organizer confirmation.


## Durable application checkpoint

Application code checkpoint: **`9977321`**, `feat: build career planning and preparation workspaces`. Source, lockfile, tests, measured load report and current documentation were committed locally after backend verification, successful build/typecheck and 17 passing tests. The secret scan found no private environment/data paths staged and no supplied token in the staged diff or client bundles. No application push or deployment occurred. A following documentation-only commit records this checkpoint; the code SHA remains the reference for this acceptance evidence.

## Hosted release evidence, 10 October 2026

The user explicitly authorized GitHub publication, managed database setup and full deployment, while retaining browser testing. App publication used an isolated writable checkout because the original checkout's Git metadata is restricted; no force-push or history rewrite occurred. The optional workflow file remains local because the available GitHub authorization lacks workflow scope. GitHub App connection is a separate repository-owner blocker.

Dedicated free Neon and Clerk resources were provisioned and connected. Clerk marketplace acceptance was completed by the user. No paid add-ons were enabled. Code compatible with the additive schema was deployed before the migration. Synthetic evaluation users/organizations were retained for the demo. Their passwords, session cookies, JWTs and provider keys are in private ignored files, never in this report.

Actual hosted results: manual roadmap create/read/mark and stale conflict; other learner/operator private read denial; learner admin and cross-origin denial; teacher assigned overview, evidence approval and assignment readback; diagnostic start/submit/history; classroom author/create/join/start, hidden answers, scored answer, stop and closed-answer rejection; foreign organization join/assignment denial. The hosted closed-answer rejection is not evidence for a duplicate-specific guard; that guard was tested independently in the local 50-player run.

The role routing release passed 20 tests/build/typecheck and was deployed as `b47555d`. Its hosted teacher redirect and authorized learner/teacher pages passed. The AI diagnostic release passed 22 tests/build/typecheck and was deployed as `1228345`. CodeCraft hosted requests returned provider 403; switching to the user-selected OpenRouter free model produced valid direct output, but hosted generation still failed. Existing plans were unchanged. Further generation results must be recorded before closing the issue.

Remaining acceptance: hosted AI generation/advice/discussions, fresh operator login, repository-owner Git connection, owned-domain production Clerk identity, user browser/mobile/speech review, hosted 50-player/fairness/turnover and restore/incident drills. A deployed demo is not enterprise certification.

## Career graph repair candidate

Safe hosted diagnostics confirmed `invalid_graph_disconnected_milestone`: the model returned skills/projects that did not reach any role. Added explicit topological/terminal-node instructions and one bounded model repair with strict validation, shared cancellation/deadline and an additional quota charge. Provider and schema failures are not retried. Twenty-five tests, typecheck and build passed; published/deployed code `2bd72b8` as `dpl_2Uvv7M5sYcufipuxnewNNtLMaxYU` (READY). Live generation is under verification. The primary demo learner reached 10 consumed requests during failures/verification; a bounded free-model demo allowance of 20 is being configured, without resetting the usage ledger.

## Live AI repair acceptance

The repaired release created a real backend-engineering roadmap through OpenRouter on the canonical learner domain, returning 201 in 48.196 seconds. It contains 16 milestones: 12 skills, 2 concrete projects and 2 roles. Both the create response and a separate authenticated owner read returned a graph that passes the full career validator, with origin `ai`. Milestone guidance returned 200 in 11.079 seconds: 3 actions, 3 assessment questions and 4 project acceptance criteria; a further roadmap read confirmed it was saved. Marking the first ready skill known returned version 2, reducing remaining effort from 204 to 189 hours. It did not immediately unlock another node in this graph; other prerequisites still apply.

The demo learner’s quota was observed at 10 consumed requests. Set production AI_DAILY_LIMIT to 20 and redeployed without resetting usage. Canonical learner `/api/me` returned limit 20 and used 10. The selected model remains free; no paid fallback was enabled. A second goal is being verified under the primary evaluation learner.

## Second live exact-role acceptance

The primary evaluation learner created a UX research roadmap for accessible education platforms through the real hosted OpenRouter pipeline: HTTP 201 in 22.938 s, 12 milestones (8 skills, 2 projects, 2 roles). A separate owner GET returned 200 and passed full schema/career-graph validation. The learner workspace also returned the new `ai` roadmap, retaining its existing manual plan/evidence/assignments. Project and role titles were inspected against both exact targets: backend API engineering/reliability and accessibility UX research produced different, relevant projects and intermediate/target roles. First-milestone advice returned 200 in 13.962 s.

Current source/docs deployment remains `1f5b65a`; the subsequent documentation publication records these results without changing application code. Provider availability is not guaranteed by these two successful checks. No browser, speech or enterprise operating pass is inferred.

## Local learner UI update, unpublished

The latest user request explicitly prohibits pushing these changes. Updated the learner navigation into Your plan, Practice and Your progress; added current-page breadcrumbs and plain-language destinations. The learning home now points to a ready non-role milestone in an unfinished roadmap, presents actual goal/time/progress data and provides links through planning, tasks and practice. Completed and empty assignment states explain what to do next.

Roadmap creation now has three numbered steps, honest AI availability/loading states, a generation status, preserved-input recovery guidance and a next-action explanation. Roadmap details explain ready/locked/recorded states, provide an anchor to the selected milestone and clarify prior-knowledge marks, completion and saved work. Related learner page headings match the navigation. Teacher/admin destinations and server permissions are preserved. Added `backend-overview.md` with the implemented architecture, data model, AI validation/repair, graph scheduling, revisions, quiz timing, discussion persistence and operating limits.

Verification: `npm run check` passed; all 25 existing unit tests passed; the final `npm run build` passed. Non-browser server-rendering checks passed for all ten learner destinations, one active sidebar link on home/tasks/create/detail paths, the initial creation form, mobile menu control attributes and preserved teacher/admin navigation. The first standalone rendering attempt encountered Clerk's Node ESM directory-import error; the verification harness uses the package's CommonJS entry instead and then passed. No production dependency or app import was changed for that harness.

The existing workspace development process was confirmed listening on port 3000 with this repository as its working directory. However, the sandbox's HTTP request to `127.0.0.1:3000/api/me` failed with curl exit 7, so no new local HTTP-flow pass is claimed. No browser was launched, no visual/mobile/keyboard interaction pass is claimed and no AI request was needed for these UI changes. No commit, push, publication-checkout update, deployment, database migration or production write was performed. The previously deployed UI remains the earlier release.

## Local refresh-loop mitigation

The user subsequently reported continuous refreshes. Inspection confirmed 10,861 HMR latency events with empty updated-module lists and 28,627 sign-in requests in the old Turbopack trace. Two different apps also listened on port 3000: Pathfinder on IPv4, another project on IPv6. `localhost:3000/app` reached the other project and returned 404, whereas the explicit Pathfinder address returned its expected sign-in redirect.

Stopped only the identified Pathfinder development session and started the same source/database with Webpack at `http://127.0.0.1:3300`. Authenticated local learner sign-in, the updated home and creation pages, `/api/workspace` and `/api/me` returned 200. Twenty further home/sign-in requests all returned 200. Updated page text and learner role were checked from actual HTTP responses. The user then confirmed “works”. No browser was launched by the agent. A raw curl HMR socket capture timed out with zero received frame bytes (exit 28), so it is not counted as a protocol/browser verification pass. The precise internal trigger of the old Turbopack churn remains unproven; the working development setup is the verified mitigation.

Saved Webpack and port 3300 as the default `npm run dev` command and updated README. Explicit test-port overrides remain available. Production build settings, identity, database contents and published release are unchanged. This fix remains local and unpublished.


## Personal quizzes and learner dashboard, local only

Implemented `/app/quizzes`: generate a private quiz from a whole saved roadmap, a phase or a milestone, or quantitative/logical/verbal reasoning; choose difficulty, 5/10 questions, multiple choice/written and optional timing. Quizzes freeze their question/key/rubric/scope snapshots. Attempts use server-clock deadlines, versioned autosaved drafts, immutable submission, saved topic scores, explanations, retakes and earlier-attempt comparisons. Weak topics prefill a fresh generation request. Incorrect/partial answers populate the notebook, with revision notes and question flags. Added the `personal_quizzes` operator flag and practice links from roadmap/milestone, preparation, home and progress pages.

Written answers are saved before grading. A database lease admits one grader, and validators require exact submitted-answer evidence for credit within the saved rubric. Failure leaves answers submitted and retryable; unanswered questions get zero without a provider call. Before submission the API omits keys, explanations, references and rubrics; attempt responses omit internal leases and owner fields. Generation and written feedback share the existing AI quota. Cached results and multiple-choice retakes do not call AI. Owner-only checks apply on the server. Scores never modify roadmap completion.

Redesigned the home with a forest-green next-milestone area, violet practice area, blue recorded progress, ordered upcoming milestones, actual saved-work counts and readable assignment/roadmap rows. Eleven learner destinations include personal quizzes separately from the reviewed diagnostic. No invented streaks, scores or sample activity appear in the dashboard.

Verification: final typecheck/build passed and 33 tests passed with zero failures. Tests cover validation, concealed keys, roles/ownership, restored drafts, stale writes, repeat submission, deadline scoring, notebook updates, paused-new-attempt controls and failed/cached written feedback. Real HTTP generation returned five reasoning MCQs across all three topics and five written HTTP/API questions for an owned milestone. MCQ scores matched the frozen key after submission. Real written feedback awarded 10/25 points for two answers with exact quotes checked; the other three questions received zero. Cached feedback consumed no additional quota. Editing the source roadmap to revision 2 left the quiz at revision 1 with identical questions/results and empty roadmap marks. Auth/ownership returned 401/404/403, stale drafts 409 and normal save/result/note flows 200. Home, quiz page and workspace returned 200 after the final restart.

Server rendering passed for empty/active/completed home states, initial quiz page, eleven learner links and preserved staff navigation. The new coloured text/background pairs measured at least 7.36:1 contrast. Browser/visual/mobile/keyboard acceptance remains user-owned; no browser was opened. Temporary verification quizzes/attempts/notes and their manual plan were removed with target checks, preserving other learner data and quota usage. Evidence: `tests/reports/local-personal-practice.json`. PGlite schema additions are local and additive. No hosted database change, commit, push or deployment occurred. Webpack development remains at `http://127.0.0.1:3300`.


## Personal-practice hosted release, 10 October 2026

Published quiz/dashboard commit `82faf53` to GitHub and promoted Vercel deployment `dpl_14Gy2CMBoT7BHzvqMm3PnCMG3wmi`. Vercel's build passed. The learner, operator and organization domains resolve to this deployment. Applied six additive quiz statements in one transaction after the compatible artifact built, preserving all six hosted roadmaps and existing flags.

Authenticated `/api/me`, workspace, self-quizzes and notebook returned 200. An isolated temporary quiz fixture exercised start, hidden answer keys, versioned draft and submission through the actual hosted API. The stored result was 3/5, 60%, with logical reasoning marked weak. Only those temporary records and their audit events were removed; six existing roadmaps remain and no AI quota was spent. New hosted AI quiz generation was not repeated because the checked learner has one daily request remaining. Evidence: `tests/reports/production-personal-practice.json`.

The first GitHub push was rejected because the current OAuth token lacks `workflow` scope. The application push succeeded after excluding `.github/workflows/ci.yml`; the workflow remains local. Automatic Vercel Git builds still require repository-owner configuration. Installed global Vercel CLI 58.4.0 completed deployment; a temporary 63.1.2 installation could not authenticate in this environment. Recommend `npm i -g vercel@latest` for subsequent work.

Two dedicated temporary verification-session tokens were accidentally exposed during diagnostic inspection; both affected verification sessions were revoked and Clerk returned `revoked`. No user browser session, provider API key or database credential was printed during this release.

## Roadmap reading, local revision

Replaced the pale dot canvas with a warm line grid and stronger major grid lines. Roadmaps open on the selected milestone's phase, retaining its direct prerequisites as labeled context. The View menu restores the full map. Focus selected zooms to the current milestone. Branches order by their parents and merge columns are centered; spacing drops from 60 to 40 pixels between columns. Nodes have larger titles, explicit Ready/Locked/Known/Done labels and phase colours. The canvas height follows the displayed graph rather than using a fixed 620/700 pixels. SVG exports use the same compact geometry, grid, wrapped titles and escaped content.

Typecheck, 37 tests and build passed. Tests cover non-overlap and forward dependencies up to 80 milestones, phase context, immutable source graphs and safe SVG export. Authenticated local workspace and saved-roadmap page returned 200. The inspected 13-node saved map has a full width of 2,232 pixels (previously 2,500); its first phase spans 528 pixels. Both existing local roadmaps were preserved. Evidence: `tests/reports/local-roadmap-reading.json`. Browser phase switching, zoom, keyboard and mobile review remain user-owned and unverified. These roadmap changes are not yet pushed or deployed.


## Roadmap reading hosted release, 10 October 2026

After the user's explicit publication approval, pushed `477b1ee` and promoted Vercel deployment `dpl_EKu3Sqq4AaYvA3PW3LzoGe4sKLwz`. The hosted build passed, and all three domains resolve to this READY deployment. Authenticated identity, workspace, quiz list, saved-roadmap page and owner data reads returned 200. The served client assets include the phase selector, full-map option, Focus selected control, major grid and adaptive canvas CSS. Provider quota remained unchanged. No further schema or provider configuration change was needed.

Evidence: `tests/reports/production-roadmap-reading.json` (recorded locally after deployment). This verifies served code and HTTP/data access; it does not verify browser rendering, phase switching, pan/zoom, keyboard or mobile appearance. User browser acceptance remains pending. The CI workflow still requires GitHub workflow scope; repository-owner Vercel Git configuration remains pending. This tracker update and hosted report were recorded after the published commit and have not been pushed again.

## Evaluator access and provider limits, local documentation update

Added the three hosted sign-in emails and surface URLs to README, with each role's scope and the unresolved fresh hosted admin password reset stated explicitly. Added the three seeded local accounts and a role-by-role evaluation path. Hosted passwords remain outside Git in `.data/evaluator-access.md`, mode 600. They are not included in README; the organizer's H-07 prohibits committed passwords. Existing local setup supplies a development example through `.env.example`.

Actual local sign-in returned 200 for learner, teacher and admin with the configured development password. Each role's page, role-specific API and `/api/me` returned 200; identity responses confirmed learner, teacher and admin in local mode. No browser was launched, no learner content was changed and no AI generation was requested. Only the three verification sessions were logged out afterward. Fresh hosted sign-in was not repeated; the admin reset remains open.

Read-only hosted PostgreSQL confirmed all three assigned roles, the learner/teacher organization memberships, five roadmaps owned by the demo learner and 19 consumed application AI requests. The recorded hosted application limit is 20; the current learner window resets at `2026-10-11T08:20:00.820Z`. OpenRouter's read-only key endpoint returned 33/50 free requests used, 17 remaining, for the configured local key. Vercel returned no decrypted value for the protected production OpenRouter variable, so production/local key equality is unverified. Recent hosted failure audit categories did not contain a provider HTTP 429; these observations do not prove the cause of the user's reported rate limit.

README now distinguishes provider free-model limits from the app's rolling per-user quota, explains waiting/top-up options and saved workflows, and documents that there is no automatic provider failover. No limit was bypassed or reset, no paid model/fallback was enabled and no production configuration, database data, push or deployment was changed. This documentation update is prepared locally for a separate publication decision.
