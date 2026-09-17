# Playable campaign

## Outcome

Build all ten sequences as a playable browser game with gray-box presentation. Art and music
are excluded by the user. Preserve the authored setting, objective-led tactics, deterministic
previews, local progress, and fixed campaign. No publication or development server is authorized.

Reuse the campaign, character, enemy, and skill identities in `frontend/src/content`. Build pure
rules in `game`, browser persistence in `storage`, and presentation in `components`.

## Decisions

- Each ready hero activates once per round, alternating with enemies in displayed order. Remaining
  enemies act after the last hero. All enemy plans remain inspectable on every difficulty.
- Four heroes deploy; the prologue is noncombat. Nera becomes available for mission 6.
- Orthogonal movement, solid walls, Manhattan ranges, conservative line of sight, and cover tiles
  make the gray-box board predictable. Incapacitated units remain visible but do not block movement.
- Preview and execution use the same pure command transition. Invalid commands leave state intact.
- Skills unlock after missions 2, 5, and 7. Late skills serve the finale; no campaign expansion is
  implied by inconsistent prose acceptance gates. Movement grants are allowed and bounded.
- Saves include schema version, mission snapshot, activation checkpoint, skill selections, story
  flags, difficulty, and roster. Browser storage failure is visible; export provides local backup.
- Representative play and complete automated campaign runs establish functionality. External
  comprehension, six-hour pacing, final balance, and cross-browser polish remain empirical work.

## Milestones

Root Sulion plan: `40a23767-6920-4b5a-9f40-d880200e75cb`.

### M0 — Deterministic tactical engine

Acceptance: all ten authored sequences have executable objectives; movement, combat, enemy plans,
shifts, conditions, skills, and outcome handling share deterministic state transitions.

Expansion: `128b2022-171c-47e5-bddd-6a5da7bc7710`, step 1: rules and authored encounters.

Execution: add versioned map data, encounter definitions, unit profiles, battle state, board
queries, action reducers, intent scheduling, and progression. Verify meaningful legal/illegal
commands, prediction parity, objective completion, and shift safety in Vitest. Keep modules below
repository size limits. Existing baseline: `make ci` passed all seven scaffold tests.

### M1 — Playable browser and durable progress [depends on M0]

Acceptance: start, deploy, play, rewind, save, resume, choose outcomes and skills, and finish the
epilogue through browser controls. Keyboard and pointer share the same commands.

Expansion: `10ab85b4-86bd-4b7e-a0bb-403000defe58`, step 1: campaign controls and persistence.
Add Canvas terrain with a keyboard-operable DOM tile grid; a confirmable action panel and complete
intent queue; deployment, difficulty and skill controls; briefings, debriefings and epilogue.
Persist validated snapshots to IndexedDB with localStorage fallback, and support local import/export.
Verify corrupt/unsupported saves, reload/rewind, and actual UI commands through component behavior.

### M2 — Campaign verification and completion [depends on M1]

Acceptance: campaign completion and recovery paths exercised; `make ci` passes; actual browser
verification and any limits recorded. Update concise usage and implementation contracts.

Expansion: `6a31b798-ab2b-41b3-b9fd-29bf79aff9e7`, step 1: verify and finish.
Review all command consumers, tighten invalid-save handling, verify progression through all ten
sequences and every finale roster, and run `make ci`. Update usage and current tactical decisions.
DOM interaction tests exercise the actual App with React and browser storage. No installed browser
executable or browser tool is available for a visual pass; do not start a development server.

## Current state

All three milestones are complete. `make ci` passes: lint with no warnings, formatting, TypeScript,
55 tests in seven files, Vite production build, and Terraform formatting. `git diff --check` passes.
The tests include a continuous campaign serialized after every activation, all five finale deployments
without story assistance, skill limits, sequential enemy forecasts, source-specific tethers, corrupt
save rejection, and browser confirmation/reload/rewind controls. The build emits approximately 297 KB
of JavaScript (94 KB gzip) and 9 KB of CSS. A frontend-local Prettier ignore fixes repeated checks
after a build by excluding generated output.

No browser executable was available for visual verification. DOM controls were exercised in happy-dom;
the real IndexedDB implementation, rendered layout, touch hardware, and human pacing remain unverified.
No development server, deployment, external publication, commit, or push was performed. The next work
is player feedback on comprehension and encounter pressure, followed by a visual browser pass.
