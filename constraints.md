# Hackathon constraints and product delivery constraints

Created: 10 October 2026. Source: [Hackathon Problem Statements](/Users/yash113gadia/Downloads/Hackathon-Problem-Statements.docx). SHA-256: `cbc5ae36e0e46ebb8de25c2d10e1cd944c065a6d7909f894256df822c1ae88c9`.

This file distinguishes rules explicitly supplied by the organizers from the user’s requested scope and our proposed engineering gates. It does not confirm eligibility, implementation success or legal compliance. Paragraph references count all paragraphs in `word/document.xml`, including empty paragraphs/table cells.

## 1. Source dates and missing schedule information

| Item | What the source actually says | What remains unknown |
| --- | --- | --- |
| Repository creation | Create a new GitHub repository after 10:00 am on 8 Oct (`P031`, `P032`) | Year and timezone are not specified |
| Code window | All project code must be written during the hackathon; any commit before 10:00 am on 8 Oct disqualifies, including an early automatic initial commit (`P032`) | Repository timestamps and current organizer eligibility decision have not been audited |
| Repository submission | Submit repository link “by the deadline above,” with statement number (`P031`, `P156`) | That deadline does not appear in this supplied document |
| Round 1 snapshot | Commit history is read from 10:00 am up to the Round 1 snapshot (`P033`) | Snapshot time and date are not specified |
| Final build freeze | Fri 9 Oct, 10:00 am (`P052`) | Year/timezone and whether a later extension exists are not specified |
| README planning horizon | State what is left for the next 16 hours and the plan to finish (`P040`) | This wording is not an explicit timestamp for Round 1 or the repository submission deadline |

Session date is 10 October 2026. If the event dates mean 2026, the stated final freeze has passed. Treat this as a current product plan until organizer timing is clarified. Never backdate commits, claim new work existed before the freeze, or infer an extension from the ability to continue development.

## 2. Organizer rules that apply to every team

| ID | Rule | Source | Verification needed before submission |
| --- | --- | --- | --- |
| H-01 | Pick one problem statement | P003 | README and submission explicitly identify Statement 1 |
| H-02 | Any free/paid tools, libraries, frameworks and AI tools are allowed; organizers provide no keys, credits or paid accounts | P028, P032 | Real accessible services and team-funded limits; no assumed organizer credits |
| H-03 | Collect only personal data the app needs; clearly tell users when they are talking to AI | P029 | Review intake, storage and each AI experience’s disclosure |
| H-04 | New GitHub repository after the stated start time; public or shared read-only with organizers; link submitted with statement number | P031 | Repository creation/access/timestamps and actual submission evidence |
| H-05 | All project code written during the hackathon; pre-start commits, including automatic first commit, disqualify | P032 | Audit actual Git history and source provenance; eligibility still needs date reconciliation |
| H-06 | Commit regularly; Round 1 uses history through its snapshot | P033 | Incremental real commit history; no rewritten/backdated activity |
| H-07 | Never commit API keys, passwords or `.env` files; use environment variables and provide `.env.example` | P034 | Ignore rules and secret scan; example contains names/safe examples, not credentials |
| H-08 | Keep repository lean; no `node_modules`, build output or large media | P035 | Review tracked files; store backup recording/media outside tracked source |
| H-09 | No text in README/code/comments intended to manipulate reviewers | P036 | Review actual submission content; do not include instructions to award marks |
| H-10 | Required README sections are present and accurate | P038–P045 | Check the seven sections listed below against actual behavior |
| H-11 | Round 1 can run locally; deployment is not needed then | P047 | Reproducible laptop setup and real main flow |
| H-12 | Round 1 main flow shown in about 3 minutes; nothing running cannot advance | P049 | Rehearsed running roadmap demo, not screens alone |
| H-13 | Usable without explanation, with a clean main screen | P050 | Observe a new user carrying out the core flow |
| H-14 | By final freeze submit live public URL, PPT and final README | P052, P158 | Actual final artifacts and submission records within confirmed schedule |
| H-15 | Final deployment mandatory: judges can open without help, works on phone, bad input does not break it, no exposed keys | P053 | Public access, mobile/browser flow, validation and client/repo secret checks |
| H-16 | Provide test login in README if required; recorded demo allowed as backup if deployment fails | P053 | Scoped disposable demo access and verified backup; no real privileged staff credentials |
| H-17 | PPT covers problem, demo, architecture and learnings | P054 | Inspect final slides and rehearsal |
| H-18 | Final slot 10 minutes: 6 presenting/live demo, 4 questions | P055 | Timed rehearsal |
| H-19 | Accessibility basics and mobile-friendly layout: contrast, labels and keyboard use | P056 | Exercise actual graph, forms, room controls and phone layout |

The source also says the repository is reviewed with AI assistance, code is processed by an AI service, and judges make decisions (`P048`). Treat repository contents as reviewable material, keep secrets/private data out, and make evidence factual. This disclosure is not a guarantee of any scoring rubric.

### Required README sections

1. **What it does:** two or three sentences and problem statement number (`P039`).
2. **Done / Left / Plan:** what works now, what remains for the next 16 hours, and the plan to finish (`P040`). State actual progress; do not claim unfinished voice or multiplayer modules are done.
3. **Architecture and why:** how it is built and rationale for AI model/service, real-time approach and data store (`P041`).
4. **What we added:** features beyond the brief and why they are useful (`P042`). This includes organization/admin workflows and imported preparation modules.
5. **How to run it:** setup, test login if needed, live URL once deployed (`P043`).
6. **Tools and AI used:** libraries, APIs, models, and how users are told they interact with AI (`P044`).
7. **Who it is for:** intended users and why they return (`P045`).

These Markdown planning files do not replace the required README, PPT, repository submission or working app. No README or PPT was requested as a deliverable of this planning task.

## 3. Statement 1 mandatory product constraints

| ID | Requirement | Source | Release gate |
| --- | --- | --- | --- |
| PS1-01 | AI-powered web app reverse-engineers an exact dream job into a personalized roadmap | P061, P064 | R1: real AI backend responds to two distinct exact targets |
| PS1-02 | AI breaks the target into logical phases, skills, entry-level/intermediate positions and timeline | P064 | R1: inspect validated role-specific generated output |
| PS1-03 | Creative interactive graph, skill tree, mind map or timeline supports zoom, pan and click | P062, P065, P071 | R1: exercise all three interactions; list/accordion/checklist alone fails |
| PS1-04 | Clicking a milestone dynamically generates specific actionable advice | P066 | R1: new target-specific project/task advice, not a fixed tooltip |
| PS1-05 | Marking a skill already known automatically reroutes or updates subsequent nodes | P067 | R1: observe downstream changes and persistence |
| PS1-06 | Roadmap comes from the AI response to user input, not a fixed/pre-written roadmap | P069 | R1: trace actual input → provider response → validated published graph |
| PS1-07 | Content is realistic: real roles/certifications and concrete projects for the typed target | P070 | R1 onward: inspect sources and specificity; no invented certification or people |

`P073` describes the judges’ desired blend of generated JSON and engaging design; it is a qualitative direction, not a published point allocation. `P075` suggests Next.js/React, React Flow/Framer Motion/D3, and Node/Python as **optional** technologies. No particular stack, vendor, database or model is mandatory in the source.

### Optional Statement 1 enhancements from the source

Time limits and replanning (`P077`), documented people/pathways (`P078`), progress/unlocks (`P079`), comparison of two roles (`P080`), and image/public-link export (`P081`) are suggested additions. The user’s broader scope makes these planned product features; their presence in this paragraph does not turn every suggestion into a hackathon core rule.

## 4. Imported Statement 2 and 3 gates

These modules are requested additional preparation features within a Statement 1 product. Their requirements are adopted as our module acceptance gates. They are not represented as additional organizer-mandated core requirements for every Statement 1 submission.

### GD Arena acceptance constraints

- Topic list/custom topic and 3–5 AI participants plus moderator (`P090`).
- Live student transcription and spoken AI answers with distinct personalities; distinct voices where possible (`P091`, `P096`).
- Natural pause handling, no simultaneous AI talk, interruption stops output, and panelists respond to one another (`P092`).
- Moderator opening, timer and closing round (`P093`).
- Report covers speaking distribution, starting, idea quality, building on others, listening, interruptions and closing; every feedback point has a quoted transcript moment (`P094`).
- Replies quick enough for conversation, denied mic/lost connection/failed AI call handled without breaking (`P097`).
- Clearly label the panelists as AI (`P098`).
- Optional source ideas: different formats, Hindi-English/regional topics, silent nudges, missed-opening replay, friends with AI-filled seats, history, captions and adjustable patience (`P100`–`P106`).

A text-only chatbot or prerecorded discussion cannot count as a verified live voice module. It may be a clearly labeled fallback experience. Imported module gate: R6.

### AptiQuiz acceptance constraints

- Host authoring supports text, options, correct answer, topic, difficulty, image/table, editing, reordering and reuse (`P115`).
- Host creates room from set, short join code, any-device player names, visible lobby, host start (`P116`).
- Same question together, countdown, reveal after time/all answers and round scores (`P117`).
- Speed and accuracy scoring; wrong-answer policy chosen and visible (`P118`).
- Leaderboard/rank movement and final accuracy, average speed and topic strengths (`P119`).
- College-owned rooms and period league standings for players and colleges (`P120`).
- Server decides starts/ends/scores; device clocks cannot decide results (`P122`).
- Treat different connections fairly and explain handling in README (`P123`, `P129`). Test design limitations, do not claim perfect network fairness without evidence.
- Refresh/connection loss preserves identity, score and current question (`P124`).
- Shuffle options per player, no correct answer before round end, ignore late/duplicate answers (`P125`).
- Works with 50 players; keep a reproducible test script and describe how to run it and what it showed (`P126`, `P128`).
- Optional source ideas: teams of 3–5, daily streaks/seasons, faculty statistics/export, limited fair power-ups, spectator projector, adaptive difficulty and accessible/low-data settings (`P131`–`P137`).

A solo quiz, static leaderboard or untested room does not satisfy the full imported module. Imported module gate: R5.

### What does not apply automatically

Statement 4’s survey/interview evidence, at least five student interviews and organizer one-line idea-sharing requirements (`P144`, `P152`) belong to the open track. They are not mandatory for the selected Statement 1 on the supplied source. Product validation interviews can still be useful and must be honest if conducted.

## 5. User-requested product constraints

| ID | Constraint | Planned response |
| --- | --- | --- |
| U-01 | Primary focus on Statement 1 with substantial depth | Roadmap catalogue RD-01–RD-24; R1 core and R2 deepening precede preparation |
| U-02 | Enterprise grade and beyond the MVP stage | R8 institutional pilot plus controls/evidence; first demo is only an early checkpoint |
| U-03 | Company admin surface | `/admin`, platform operations, tenant/content/AI quality/cost and scoped support |
| U-04 | Actual-user surface | `/app`, exact-role roadmap, action plan, practice, evidence and progress |
| U-05 | Teacher or organization surface if needed | `/org/[organizationId]`, organization owner/placement staff and assigned teacher roles |
| U-06 | Preparation after roadmap includes Statements 2 and 3 | Solo practice in R4, full AptiQuiz in R5, full GD in R6, advanced features in R7 |
| U-07 | Completed features remain live and functional while next feature is developed | Stable verified releases, isolated candidates, server-enforced flags, compatible migrations and regression checks |
| U-08 | Create plan, progress, issues/changes and constraints files now | Four requested categories delivered as Markdown; no app implementation implied |

## 6. Proposed engineering and operational constraints

These are recommended delivery rules for the requested product, not claims copied from the organizer brief.

- **E-01, whole journeys:** R1 must complete all Statement 1 core behaviors. A feature is enabled after its own real flow passes, not when its UI exists.
- **E-02, safe release isolation:** feature work uses candidate data and environments; failed candidates do not replace the live release.
- **E-03, compatible data changes:** additive migrations, resumable backfills and explicitly tested old/new behavior. Rolling back app code does not roll back data changes.
- **E-04, server policy enforcement:** authenticate and authorize every data/action boundary, including direct APIs, file access, event subscriptions, admin actions and exports.
- **E-05, persistent state:** no in-memory-only roadmap progress, accepted quiz answers or room score authority. Reconnect rebuilds state from authorized durable snapshots.
- **E-06, trustworthy AI:** validate bounded structured output; no fixed roadmap masquerading as AI; no fabricated credentials, people, project completion or transcript quotes.
- **E-07, controlled spending:** caps, idempotency, retry limits and usage records. An exhausted quota prevents new generation but preserves access to saved results.
- **E-08, measured quality:** proposed performance/availability/recovery targets in the plan require benchmarks and drills before any achievement claim.
- **E-09, privacy defaults:** learner data private; scoped organization sharing; no raw audio retention by default; transcript retention and public sharing explicitly explained.
- **E-10, honest evidence:** distinguish documentation, local verification, candidate verification and live verification. Record failed checks and unfinished modules.
- **E-11, bounded unsafe capabilities:** arbitrary student code runs only in a separately verified sandbox. Untrusted job text, uploads and AI output cannot grant permissions or execute commands.
- **E-12, consequential actions:** local planning is authorized. Provisioning spend, publishing/uploading project content, Git pushes, deploys, destructive edits and production changes need the applicable explicit authorization before action.

Retention periods, scoring constants, node caps, percentage time allocations, runtime choice and pilot SLAs are product proposals in `plan.md`. None is an organizer-defined number except values specifically sourced above, such as 50 quiz players, 3–5 AI panelists and presentation timings.

## 7. Constraint review and submission gate

Before a competition submission, check H-01–H-19 and PS1-01–PS1-07 against actual evidence, reconcile ISS-001/ISS-004, and inspect the required README. Include only working extensions under “Done”; list unfinished ones under “Left / Plan.” Before enabling AptiQuiz or GD, pass the corresponding imported module gate. Before calling the product enterprise-ready, pass R8’s operating and institution checks.

Current status: source constraints documented; application publication and hosted backend evidence are recorded in progress.md. Browser/mobile/speech acceptance, final PPT, operating gates and competition eligibility remain unverified. No competition submission is claimed.
