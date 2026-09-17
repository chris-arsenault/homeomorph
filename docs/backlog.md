# Backlog

## Current playable build

The ten-sequence gray-box campaign now implements the engine, board, objective interactions,
declared intents, shifts, all core kits and skill selections, dialogue outcomes, local saves,
and rewind. Automated runs complete every sequence on Standard and all five finale rosters.
Browser-control tests cover confirmation, keyboard navigation, reload, and rewind.

The next work needs player evidence: test whether the action panel and intent queue are understood,
measure encounter length and pressure, improve spatial variety and escort presentation, and verify
rendering on desktop and touch browsers. Art and music were deliberately excluded from this build.
The implementation does not establish the six-to-eight-hour target or external comprehension gates.

## Production roadmap

The next implementation work follows production risk, not story chronology.

### Proof of rules — implemented

- Define board, unit, objective, intent, command, and shift-event state.
- Implement movement reachability and line of sight with exact previews.
- Implement alternating activations, Guard, Marked, Restrained, and incapacitation.
- Render one gray-box board with keyboard, pointer, and touch input.
- Add activation-start undo and versioned local save.
- Build the proof room defined in `design/scope.md`.

### Production test — player validation remains

- Define versioned authored map JSON and validation.
- Build objective and dialogue scripting from small declarative triggers.
- Implement mission 2 with three enemy roles and no bespoke engine paths.
- Establish final-size character, tile, effect, interface, and audio samples.
- Run the first external comprehension test and record encounter worksheets.

### Campaign alpha — playable, tuning remains

- Implement remaining enemy roles and all five core kits.
- Build missions in dependency order: 3, 5, 6, 4, 7, 8, then prologue and epilogue.
- Add skill tiers only after baseline missions are completable with core kits.
- Integrate story flags, scene variants, and finale assistance.

Anything not traceable to these stages or the fixed content budget remains uncommitted.
