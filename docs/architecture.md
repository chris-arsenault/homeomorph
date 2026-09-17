# Architecture

Homeomorph uses the smallest architecture that can support an authored tactical campaign.

## Boundaries

`content` contains typed definitions and validators. It may depend on shared value types but never
on React or browser APIs. `game` contains pure deterministic state transitions and queries. It may
read content definitions but never render. `components` renders content and, later, game state. It
may issue commands but may not reproduce rules.

```text
content definitions ──┐
                     ├── game rules ── serialized campaign state
authored maps ────────┘       │
                              └── React presentation and input
```

## State

Campaign state contains a schema version, completed missions, deployment, skill choices, story flags,
difficulty, current mission snapshot, and activation checkpoint. Save data uses JSON in IndexedDB
with a localStorage fallback. Available stores receive timestamped copies; load selects the newest.
The `storage` boundary validates imported and persisted data before passing it to the game. Migration
functions are required before a released schema changes. Content definitions and transient UI state
do not enter saves.

## Determinism

Combat commands are plain data. Given identical content, state, and commands, rules produce identical
results. No domain code reads the clock, DOM, network, or unseeded random values. If later presentation
uses cosmetic randomness, it must not affect state and receives a separate seeded source.

## Content

Characters, skills, enemy roles, and missions are exported as typed readonly arrays. Validation runs
in tests and Vite startup. Maps use versioned JSON validated at build time. Prefer direct
references by stable ID over inheritance or an entity-component framework.

## Presentation

React owns menus, panels, focus, and input translation. Canvas renders terrain behind a DOM tile grid
containing unit labels and accessible controls. Previews run the same pure transition as execution;
the UI never calculates damage or action legality. CSS remains component-local,
with global variables and resets in `styles.css`.

## Deployment

Vite produces static assets. Terraform provisions the Ahara website module. CI reproduces the Ahara
TypeScript and Terraform checks without requesting AWS credentials. The shared deployment workflow
cannot be used before infrastructure registration because it requires those secrets even when deploy
is disabled; the parameterless deployment script is the intentional entry point after registration.
