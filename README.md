# Homeomorph

Homeomorph is a compact, deterministic tactical RPG set in one habitat of the Glass
Frontier. A rescue society arrives during the habitat's periodic spatial reconfiguration,
mistakes a difficult way of life for an extinction event, and places the population under
emergency custody. A five-person local crew must resist without turning sincere rescuers
into monsters—or denying the real failures their own leaders concealed.

The browser build is a playable gray-box campaign: nine missions and a playable epilogue across
six authored maps. It includes four-person deployment, five protagonists, thirty skill choices,
deterministic combat, declared enemy actions, scheduled route changes, story assistance, and local
save/resume. Art and music are not included. Encounter pacing and difficulty still need human
playtesting; the build does not yet establish the intended six-to-eight-hour duration.

## Start here

- [Design index](docs/design/README.md)
- [Game pillars](docs/design/pillars.md)
- [Campaign and levels](docs/design/levels.md)
- [Story](docs/design/story.md)
- [Combat](docs/design/combat.md)
- [Cast and skill trees](docs/design/cast.md)
- [Scope and completion gates](docs/design/scope.md)
- [Canon boundary](docs/canon-boundary.md)

## Development

Requires Node.js 24.12.0 and pnpm 10.29.3.

```sh
cd frontend
corepack enable
pnpm install
pnpm dev
```

From the repository root, `make ci` runs linting, formatting checks, type checking, unit tests,
the production build, and Terraform formatting. Individual targets are also available.

## Playing

Choose a difficulty and deploy four crew members. Select a ready person, choose an action, inspect
a board tile, and confirm the preview. Each activation has two AP. End the activation to resolve
the next declared enemy action; remaining enemies act after the final crew member.

Arrow keys move focus around the board. Tab reaches the action controls. Touch and mouse use the
same inspect-and-confirm flow. The header offers larger text, save export, and save import.

Objectives win missions. Incapacitated enemies can be bypassed, and isolated injured people can
surrender. The prologue and epilogue have no enemies or deadline. Rewinds restore the start of the
last activation, including enemy consequences. Restarting a mission preserves earlier choices.

Progress saves after each change, using IndexedDB and a localStorage fallback. Export a JSON backup
before clearing browser data or changing devices. Imports validate the complete snapshot before
offering to replace progress. No accounts, telemetry, or cloud saves are used.

## Architecture

The application is a browser-only React and TypeScript project built with Vite. Authored game
content lives as typed data in `frontend/src/content`; deterministic rules live in
`frontend/src/game`; the React layer renders those contracts. There is no server, account,
telemetry, live economy, procedural campaign, or runtime dependency on canon repositories.

Terraform follows the Ahara static-website convention. CI runs the complete verification suite
without AWS credentials. Deployment remains intentionally disabled until the project is registered
in Ahara infrastructure; `scripts/deploy.sh` is the single deployment entry point after that.

## License

[MIT](LICENSE)
