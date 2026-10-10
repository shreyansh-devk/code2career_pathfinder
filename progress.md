# Code to Career progress tracker

Last updated: 10 October 2026. Primary brief: Statement 1. Product plan: [plan.md](plan.md). Constraints: [constraints.md](constraints.md). Issues and decisions: [issues-changes.md](issues-changes.md).

## Current verified state

The source document has been read and the four requested planning/tracking files have been created. Application implementation has not started in this task. No application flow has been run, no integrations have been provisioned, and no application release or deployment is claimed.

| Item | State | Evidence or limitation |
| --- | --- | --- |
| Source document analysis | Verified | DOCX XML extracted, all nonempty main paragraphs read, table included; headers/footer/comments/revisions checked; embedded image inspected and identified as logo |
| Statement 1 priority and imported preparation scope | Documented | `plan.md` sections 1, 3, 4 and 5 |
| Three surfaces and permissions | Documented | `plan.md` section 2 |
| Incremental releases and enterprise horizon | Documented | R0–R8 in `plan.md` section 9 |
| Organizer constraints and timing uncertainties | Documented | `constraints.md`; date conflict recorded as ISS-001 |
| Planning file structural validation | Verified | Local check exited 0: all four files, local links, table columns, fences, release/feature IDs, source hashes, paragraph bounds and status honesty passed |
| Vercel CLI version | Verified | `vercel --version` returned `58.4.0` |
| Marketplace discovery | Failed | `vercel integration categories` exited 1; cache permission errors and `fetch failed`; see ISS-003 |
| Credentials and provider resources | Not verified | No values inspected or copied; no integration provisioned |
| Repository/event eligibility | Not verified | No repository history audit performed in this planning task |
| Planning repository publication | Blocked | User authorized `shreyansh-devk/code2career_pathfinder`; `git init -b main` failed because `.git` writes are denied; GitHub network access and in-app browser unavailable; no commit/upload created |
| Application build, tests and end-to-end behavior | Not run | This request produced planning files only |
| Latest verified application release | None recorded | No commit, release tag or application test evidence |
| Live URL | None recorded | No deployment performed |

Documentation progress is not application progress. There is no honest app-completion percentage yet. A checked item below means its stated evidence exists, not simply that code has been written.

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
| R0 | Real integration and environment readiness | Planned | Accounts, credentials, budget and tooling | None |
| R1 | Full Statement 1 core | Planned | R0 | None |
| R2 | Roadmap personalization and depth | Planned | R1 | None |
| R3 | Three functional surfaces | Planned | R1/R2 and tenant policies | None |
| R4 | Solo preparation and evidence loop | Planned | R3 and reviewed content | None |
| R5 | Full multiplayer AptiQuiz | Planned | R4 and durable room-runtime proof | None |
| R6 | Full spoken GD Arena | Planned | R4 and verified speech services; scheduled after R5 | None |
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
- [ ] Define secret handling, ignored files, `.env.example`, setup and environment verification.
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
- [ ] Exercise another user’s direct API request and verify denial.
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
- [ ] AQ-07: reconnect retains identity, accepted answers, score and current question.
- [ ] AQ-08: shuffled options, no premature answer exposure, ignored late/duplicate/replayed answers.
- [ ] Fairness design is tested across latency profiles and its limits are explained in README.
- [ ] AQ-09: the repository contains a runnable 50-player test script and actual local/candidate results.
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
| VER-007 | 2026-10-10 | Requested GitHub publication | Blocked; Git status reported no repository, GitHub CLI connection failed, API escalation rejected, browser unavailable and Git initialization denied. See ISS-009 |

## Next executable step

Start R0 when implementation is requested. Resolve ISS-001 for any competition eligibility claim and ISS-002/ISS-003 for real service setup. Then deliver R1 before adding preparation. Until then, keep every application release in Planned state.
