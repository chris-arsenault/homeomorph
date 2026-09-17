# Homeomorph

Homeomorph is a compact turn-based tactical RPG for the browser, set in a single Glass Frontier
habitat. It is intentionally conventional in its tactical grammar and specific in its story.

## Critical rules

- Read `AGENTS.md` and `docs/design/README.md` before implementation work.
- Treat design documents as the game contract; keep typed content synchronized with them.
- Preserve the fixed scope: five heroes, four deployed, nine tactical missions, one epilogue,
  one primary enemy society, no procedural or online systems.
- Combat is deterministic. Show enemy intent and scheduled map changes before resolution.
- Keep game and content modules pure. React renders state; it does not own combat rules.
- Do not promote repository-original lore into broader Glass Frontier canon without review.
- Use pnpm. Do not enable automated deployment before Ahara infrastructure registration.

## Layout

- `docs/design/` — canonical game design
- `docs/canon-boundary.md` — existing setting facts versus proposals
- `frontend/src/content/` — typed campaign, roster, enemy, and skill data
- `frontend/src/game/` — deterministic combat rules
- `frontend/src/components/` — browser presentation
- `infrastructure/terraform/` — Ahara static-site infrastructure
- `scripts/deploy.sh` — parameterless deployment entry point

## Checks

From the repository root, run `make ci`. During focused frontend work, run `pnpm lint`,
`pnpm typecheck`, `pnpm test`, and `pnpm build` from `frontend`.

## Architecture

Vite builds a React 19 and strict TypeScript application. Content is data, rules are pure
functions, and the UI is a replaceable consumer. Browser persistence stores validated campaign and
activation snapshots; no backend is required. See `docs/architecture.md` for durable decisions.
