# Homeomorph Agent Guide

Homeomorph is a design-first, browser-only tactical RPG in the Glass Frontier. Preserve its
small authored scope and legible deterministic rules.

## Read before changing the game

1. `docs/design/README.md`
2. `docs/design/pillars.md`
3. The focused design document for the system being changed
4. `docs/canon-boundary.md` for setting or story work
5. `docs/architecture.md` for implementation boundaries

When code and design disagree, stop and resolve the design contract. Do not silently make the
TypeScript implementation the source of truth.

## Non-negotiable constraints

- One habitat, one primary opposing society, five protagonists, nine tactical missions, and one
  playable epilogue.
- Four units deploy. Units receive two action points. Attacks are deterministic.
- Enemy intent and habitat shifts are shown before they resolve.
- Most mission objectives are not extermination. Defeat means incapacitation unless a story
  event explicitly says otherwise.
- No procedural levels, random loot, crafting, base building, relationship simulation, open
  world, branching campaign graph, online services, or metaprogression.
- Story choices alter scenes, assistance, optional objectives, and epilogues—not level count.
- New names and facts in this repository are proposal canon until accepted upstream.

## Code boundaries

- `frontend/src/content`: typed authored definitions and validation; no React or browser APIs.
- `frontend/src/game`: pure deterministic rules; no React, DOM APIs, clocks, or unseeded random.
- `frontend/src/components`: presentation and interaction only.
- Keep files under 400 lines and functions under 75 lines. Prefer explicit data over abstraction.
- Use component-local plain CSS and shared variables in `styles.css`; do not use inline styles.
- Add tests for rules, validators, and defects. Do not test framework wiring for its own sake.

## Commands

Run from `frontend` unless noted:

- `pnpm dev` — local browser build
- `pnpm lint` — lint
- `pnpm typecheck` — TypeScript checks
- `pnpm test` — unit tests
- `pnpm build` — production build
- `make ci` — complete repository check from the root

Use pnpm only. Update design documents with material rule or scope changes. Add an ADR when a
durable architectural decision changes.

## Git and deployment

Use imperative commit messages and keep commits focused. Never commit secrets. The CI workflow is
verification-only because Ahara's shared deployment workflow requires AWS secrets even when its
deployment input is disabled. Do not adopt that workflow or enable deployment until Homeomorph has
an intentional Ahara infrastructure registration and the hostname is confirmed.
