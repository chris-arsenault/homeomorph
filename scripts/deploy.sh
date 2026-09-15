#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$repo_dir/frontend"
corepack pnpm install --frozen-lockfile
corepack pnpm build

cd "$repo_dir/infrastructure/terraform"
terraform init
terraform apply -auto-approve

