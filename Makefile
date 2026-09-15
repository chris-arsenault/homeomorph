.PHONY: ci lint lint-fix format format-check typecheck test build terraform-fmt-check deploy

ci: lint format-check typecheck test build terraform-fmt-check

lint:
	cd frontend && pnpm exec eslint .

lint-fix:
	cd frontend && pnpm exec eslint . --fix

format:
	cd frontend && pnpm exec prettier --write . ../docs ../README.md ../AGENTS.md ../CLAUDE.md ../CHANGELOG.md ../platform.yml ../.github

format-check:
	cd frontend && pnpm exec prettier --check . ../docs ../README.md ../AGENTS.md ../CLAUDE.md ../CHANGELOG.md ../platform.yml ../.github

typecheck:
	cd frontend && pnpm exec tsc -b

test:
	cd frontend && pnpm exec vitest run

build:
	cd frontend && pnpm run build

terraform-fmt-check:
	terraform -chdir=infrastructure/terraform fmt -check

deploy:
	./scripts/deploy.sh

