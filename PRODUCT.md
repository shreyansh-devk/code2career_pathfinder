# Pathfinder product context

Pathfinder helps a learner turn a specific career goal into a dependency-aware plan, record work and obtain teacher feedback. Statement 1 is the primary brief. Preparation grows from the roadmap; the full speech discussion and multiplayer quiz releases remain separately gated in plan.md.

## People and workflows

- Learner: define a goal and constraints, navigate a skill graph, select a milestone, save evidence, mark known skills and follow the next available work.
- Teacher or organization: see only assigned learners, assign work and review evidence in the organization workspace.
- Platform operator: inspect service readiness, control release switches and read redacted audit events. Operators do not acquire access to private learner roadmaps by default.

## Delivery contract

Each slice must run independently. Missing AI credentials produce an explicit unavailable state, never a prewritten roadmap presented as generation. Existing saved roadmaps and manual work continue to function during provider outages. Development accounts and local storage are clearly identified and cannot silently become production authentication or storage.

## Interface direction

Students and teachers use laptops and phones in bright classrooms, often while switching between notes and project work. Use a light, restrained workspace with a white background, readable neutral text and a green primary action. Prioritize the plan canvas and next action over marketing panels. The learner home uses a forest-green next-milestone area, muted violet practice and pale blue recorded progress. Colours indicate purpose; counts come from saved activity.

Use one system sans-serif family, fixed readable type sizes, restrained borders, compact tables on desktop and stacked rows on phones. The main graph supports pan, zoom, keyboard selection and an equivalent accessible list. Every asynchronous action has loading, empty, error and recovery states. Motion is limited to short feedback and respects reduced-motion settings.

## Success and boundaries

Success means a validated role-specific graph survives refresh, known skills update prerequisites, evidence is saved, assigned staff can review it and another learner cannot read it. A production readiness claim additionally requires real managed authentication, database and AI flow verification, operational controls and the later release gates documented in progress.md.
