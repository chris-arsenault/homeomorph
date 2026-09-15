# Scope and Completion

## Product boundary

Homeomorph is a single-player browser game with a six-to-eight-hour authored campaign. It supports
desktop browsers first and touch-capable layouts without requiring reflex input. Progress is local
to the browser. The finished game can be played without accounts, servers, subscriptions, or an
internet connection after load.

## Fixed content budget

- one habitat and one central conflict;
- five playable protagonists, four deployed at a time;
- five principal NPCs;
- eight enemy roles, including machines and local auxiliaries;
- prologue, eight tactical missions, and playable epilogue;
- six base maps assembled from four environment kits;
- thirty selectable skills plus ten core character actions;
- three difficulty presets and five custom dimensions;
- one convergent finale with scene and assistance variants.

Expanding a number above requires cutting equivalent work elsewhere and recording the decision.

## Explicitly out of scope

No multiplayer, user accounts, cloud saves, procedural maps, random events, endless mode, daily
challenge, mod system, character creator, recruitment, romance, faction reputation simulation,
crafting, loot, shops, base construction, strategic world map, voice acting, cinematic animation,
physics simulation, general topology engine, or adaptation of the entire Glass Frontier ruleset.

## Milestones

### 1. Proof of rules

One gray-box room supports movement, deterministic strikes, visible intent, objective interaction,
one authored shift, undo, and save/load. It uses Mara, Iven, retrieval officer, brace carrier, and
lock engineer. Completion gate: a fresh player predicts every outcome before committing.

### 2. Production test

Mission 2 is playable with final architecture, representative art, dialogue, accessibility, sound,
and content tools. Completion gate: one mission can be built and revised without changing engine
code, and three outside testers complete it without verbal help.

### 3. Campaign alpha

All ten sequences are playable with complete objectives, enemies, shifts, skills, choices, saves,
and placeholder presentation. Completion gate: the campaign can be finished from a fresh save with
every legal roster and no developer intervention.

### 4. Content beta

All writing and assets are present. Balance, accessibility, performance, and browser compatibility
remain. No new systems or missions enter after this point.

### 5. Release candidate

All acceptance gates in `difficulty.md` pass; credits, license notices, recovery from corrupt saves,
and deployment are verified. Remaining work is release-blocking defects only.

## Cut order

If progress slows, cut in this order: extra scene variants, secondary animation, optional dialogue
interactions, one skill tier per character, mission-specific props, then one middle mission folded
into its neighbor. Do not cut intent clarity, deterministic previews, accessibility foundations,
the voluntary-passage mission, the Assembly revelation, or the playable epilogue.

## Change test

Before accepting a new feature, answer:

1. Which pillar does it strengthen?
2. Which existing decision becomes more interesting?
3. What implementation, content, tuning, interface, and test work does it add?
4. What leaves the fixed budget to pay for it?

An exciting idea with no credible fourth answer belongs in another game.
