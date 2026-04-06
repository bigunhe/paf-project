# 04 - GIT VERSION CONTROL AND TEAM WORKFLOW

## 1. The Golden Rules of the Monorepo
* **NEVER push directly to the `main` branch.** * **NEVER edit a file outside of your assigned `features/` folder** unless you have explicitly communicated with the team lead.
* **Commit frequently.** The grading rubric strictly penalizes "single-day bulk commits." You must commit after every logical step (e.g., "created Resource entity", "added Resource POST endpoint").

## 2. Branching Strategy
Everyone must work on their own isolated feature branches. Create your branch off of `main` using this exact naming convention:
* Member 1: `feat/m1-facilities`
* Member 2: `feat/m2-bookings`
* Member 3: `feat/m3-maintenance`
* Member 4: `feat/m4-auth`

*Command to create and switch to your branch:*
`git checkout -b feat/m1-facilities`

## 3. Commit Message Standards
Your commit messages must be clear for the evaluator to see your individual contribution.
* **Format:** `[Module] Action performed`
* **Good:** `[Bookings] Added conflict checking logic to POST endpoint`
* **Good:** `[UI] Styled the Ticket submission form`
* **Bad:** `fixed stuff`, `update`, `code`

## 4. The "Danger Zone" Protocol (Shared Files)
The following files are globally shared. If two people edit them at the same time, Git will break. 
1. `/frontend/src/features/core/App.jsx` (Routing; root `App.jsx` re-exports)
2. `/backend/pom.xml` or `/frontend/package.json` (Dependencies)
3. `/backend/src/main/resources/application.properties` (DB config)

**How to handle them:** Do NOT let your AI overwrite these files. If your AI suggests a change to `App.jsx`, manually copy-paste ONLY your specific line (e.g., your new `<Route>`) into the file.

## 5. The Safe Merge Workflow
When your feature is working locally and you are ready to update the main repository, follow these exact steps:
1. `git add .`
2. `git commit -m "[Your Module] Description of work"`
3. `git checkout main`
4. `git pull origin main` (This pulls any new code your team has merged).
5. `git checkout your-feature-branch`
6. `git merge main` (This merges the team's updates into your code. Fix any conflicts here, locally).
7. `git push origin your-feature-branch`
8. Open a Pull Request on GitHub and have the team lead merge it.