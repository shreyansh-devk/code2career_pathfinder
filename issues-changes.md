# Code to Career issues changes and decisions

Last updated: 10 October 2026. Related files: [plan.md](plan.md), [progress.md](progress.md), [constraints.md](constraints.md).

This log distinguishes observed failures and missing information from anticipated engineering risks. A planned mitigation is not proof that a risk has been resolved. Priority P0 blocks the relevant eligibility or release gate; P1 needs resolution before its dependent feature; P2 can be resolved during its scheduled release.

## Open issues and dependencies

| ID | Type | Priority | State | Affects | Finding and next action |
| --- | --- | --- | --- | --- | --- |
| ISS-001 | Timing/eligibility uncertainty | P0 for competition claims | Open | Original submission | Source says Fri 9 Oct 10:00 am final freeze; session date is 10 Oct 2026. Year/timezone and current organizer policy need confirmation. Do not claim post-freeze work was eligible or backdate commits |
| ISS-002 | Service dependency | P1 | Not verified | R0/R1 and later voice | Credentials, accounts, credits and spend limit have not been confirmed. Organizers provide none. Verify actual authorized resources before implementation; no fake AI success |
| ISS-003 | Observed tooling failure | P1 | Open | Integration provisioning | Installed Vercel CLI 58.4.0; read-only category discovery exited 1 with restricted cache writes and fetch failure. Upgrade/check current CLI, use an authorized writable cache/environment, then retry discovery |
| ISS-004 | Source omission | P1 for submission | Open | Repository and Round 1 | “Deadline above” and Round 1 snapshot timestamp are not provided in this DOCX. Obtain current organizer schedule; do not invent times from the README’s “next 16 hours” wording |
| ISS-005 | Planning assumption | P1 | Open | Release estimates | Team size, actual remaining build window, target institutional scale and budget unknown. Re-estimate after R0; do not promise all releases in a hackathon day |
| ISS-006 | Architecture spike | P1 | Planned | R5/R6 | Real-time runtime, shared coordination, scheduler lifecycle and speech capabilities must be verified under deployment limits. Spike reconnect, process turnover and durable state before enabling rooms |
| ISS-007 | Data/content dependency | P1 | Planned | RD-06/RD-12 and preparation | Need reviewed references, legitimate pathway evidence, question answers and rubrics. No fabricated people, credentials, job listings or quoted transcript moments |
| ISS-008 | Pilot decisions | P2 | Open | R8 | Confirm organization retention/sharing expectations, required identity integration, support owner and operating targets with actual pilot institution before claiming enterprise readiness |
| ISS-009 | Observed access blocker | P1 | Open | Planning-file publication | User authorized publication to `https://github.com/shreyansh-devk/code2career_pathfinder`. Shell GitHub access failed, API escalation was automatically rejected, in-app browser is unavailable, and `git init -b main` returned `.git: Operation not permitted`. Enable authorized Git/network access or publish from the user's terminal; no commit or upload was created |

ISS-001 and ISS-004 do not block producing or using the product plan. They block an honest claim that newly produced work meets the original competition schedule. ISS-002 and ISS-003 have not been investigated as an implementation blocker beyond the read-only checks recorded here.

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

No provider installation was attempted. Current official documentation was used to inform recommendations. The attempted Neon Vercel guide fetch also returned an internal error; a verified Vercel integration catalog listing supports the Neon recommendation, not a claimed successful setup.

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

These are design risks, not observed application bugs. No application exists as a deliverable of this task.

## Decision log

| ID | Decision | Basis and consequence | Status |
| --- | --- | --- | --- |
| DEC-001 | Statement 1 stays primary | User instruction and source “pick one”; preparation is listed as added value | Adopted for plan |
| DEC-002 | Create four Markdown files | User listed plan, progress, issues/changes and constraints, despite saying “2–3” initially | Implemented |
| DEC-003 | Third surface is organization workspace with teacher roles | User allowed teacher or organization; organization scope also supports college leagues, cohorts and placement staff | Planning assumption, explicit in plan |
| DEC-004 | Company admin means platform operator | Distinguishes operator controls from institution controls; recruiting-company portal not assumed | Planning assumption |
| DEC-005 | One modular repository and shared identity/data contracts | Keeps three surfaces consistent and avoids premature service duplication | Recommended, not scaffolded |
| DEC-006 | R1 completes the entire roadmap core | A working visualization alone misses dynamic node advice/rerouting; both are required before extra modules | Adopted release gate |
| DEC-007 | R5 is full AptiQuiz; R6 is full spoken GD | Preserve source depth and avoid claiming solo/text practice fulfills the imported real-time modules | Adopted release gates |
| DEC-008 | Last verified release remains usable during development | User’s timing-resilience requirement; use isolated candidates, flags, compatible schema and core smoke checks | Adopted delivery rule |
| DEC-009 | Enterprise objective continues through R8 | First demo is an early checkpoint; institutional controls and operating evidence remain required work | Adopted product horizon |
| DEC-010 | Proposed managed auth/PostgreSQL/AI integrations | Vercel guidance and current primary docs; no installation, spend or compatibility proof yet | Recommendation pending R0 |
| DEC-011 | No fabricated pathway or outcome evidence | Honest realism requires sources and clear hypothetical labels | Adopted content rule |
| DEC-012 | Network fairness and readiness are qualified claims | Quantified design/test criteria instead of claiming perfect click-time knowledge or guaranteed employability | Adopted measurement rule |

## Change log

### CHG-001 on 10 October 2026

Created `plan.md`, `progress.md`, `issues-changes.md` and `constraints.md` from the supplied DOCX and the user’s scope. Added detailed roadmap features, three surface workflows, preparation modules, data/architecture design, release gates, verification, an enterprise pilot horizon, and original organizer constraints.

External application content was not uploaded. No provider resource was provisioned, no code was scaffolded, no repository was created or pushed, and no app was deployed. Read-only online documentation and integration discovery were consulted; discovery failed and is recorded above.

Validation status: passed local four-file checks. The Python checker exited 0 after validating file presence, local links, table columns, code fences, release/feature IDs, source hashes, paragraph bounds, issue references and unchecked application work. This is documentation verification, not application testing.

### CHG-002 on 10 October 2026

Recorded the user-authorized GitHub destination and attempted publication checks. Local folder was not a Git repository. GitHub CLI reported connection/authentication failures in the restricted shell; those checks do not establish usable credentials. The unrestricted API request was rejected by automatic approval review because shell escalation is disabled. Browser initialization returned `Browser is not available: iab`. Local Git initialization failed with `/Users/yash113gadia/code-to-career/.git: Operation not permitted` and exit code 1. No files were published and no commit was made.

## Maintenance rules

For a new issue, record ID, observed evidence, affected release, owner when known, next action and resolution proof. For a change, record what changed, why, which requirement/release it affects and its verification. For a decision, distinguish a recommendation from a user-confirmed choice.

Do not close an issue because a mitigation has been written. Close it after the relevant evidence exists. If moving scope to a later release, update the plan, tracker and README consistently, and retain the current working release.
