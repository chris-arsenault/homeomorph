# 0001 — Design-first Browser Foundation

**Status:** Accepted

## Context

The project must be finishable by a small group of coding agents guided at a high level. Novel
machinery and undefined content create tuning and coordination costs that outlast enthusiasm.

## Decision

Use a browser-only React and TypeScript application with no backend. Establish the complete bounded
game design before building a vertical slice. Keep content as typed data, rules as pure functions,
and presentation replaceable. Follow Ahara repository, CI, and static-site conventions.

## Consequences

The repository can verify design-linked content early and deploy as static assets. It deliberately
does not demonstrate full gameplay at scaffold time. Systems that require services or broad
simulation need a new decision and a compensating scope cut.
