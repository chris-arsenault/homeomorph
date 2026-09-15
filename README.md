# Homeomorph

Homeomorph is a compact, deterministic tactical RPG set in one habitat of the Glass
Frontier. A rescue society arrives during the habitat's periodic spatial reconfiguration,
mistakes a difficult way of life for an extinction event, and places the population under
emergency custody. A five-person local crew must resist without turning sincere rescuers
into monsters—or denying the real failures their own leaders concealed.

This repository is deliberately design-first. It contains the campaign, cast, enemy force,
combat contract, progression, difficulty model, production limits, and canon boundary needed
to make the game without inventing its foundations during implementation. The browser build is
a small, typed reference surface rather than a vertical slice.

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
