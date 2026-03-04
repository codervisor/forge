---
name: monorepo-version-sync
description: >
  Coordinated versioning across packages and languages in a polyglot monorepo.
  Use when: (1) Managing versions across Node and Rust packages, (2) Publishing
  from a pnpm/npm workspace, (3) Working with workspace:* protocol,
  (4) Setting up pre-release/dev versioning, (5) Debugging version mismatches.
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---

# Monorepo Version Sync

Teach agents how to manage coordinated versioning across a polyglot monorepo
with Node.js and Rust packages.

## When to Use This Skill

Activate when any of the following are true:
- Project has `pnpm-workspace.yaml`, `lerna.json`, or `turbo.json`
- Multiple `package.json` files exist in subdirectories
- Both `Cargo.toml` and `package.json` are present
- User asks about version syncing, workspace protocol, or pre-release versions
- Scripts named `*version*` or `*sync*` exist

## Core Concept: Single Source of Truth

Root `package.json` owns the version. Everything else derives from it.

```
root package.json (version: "0.2.15")
  │
  ├── packages/cli/package.json        → 0.2.15
  ├── packages/sdk/package.json        → 0.2.15
  ├── packages/shared/package.json     → 0.2.15
  ├── Cargo.toml                       → 0.2.15
  └── platform-packages/*/package.json → 0.2.15
```

**Never manually edit** version in child packages or Cargo.toml.
Always update root, then run sync.

## Version Sync Flow

```bash
# 1. Bump version in root
npm version patch    # 0.2.15 → 0.2.16
# or: npm version minor / npm version major

# 2. Sync to all packages
pnpm tsx scripts/sync-versions.ts

# 3. Verify
grep '"version"' packages/*/package.json
grep '^version' Cargo.toml
```

### What sync-versions.ts Does

1. Reads `version` from root `package.json`
2. Updates every workspace `package.json` → same version
3. Updates `Cargo.toml` version field via regex:
   ```
   /^version\s*=\s*"[^"]*"/m → version = "0.2.16"
   ```
4. Updates platform package manifests (if generated)
5. Reports: updated / skipped / errors

## Workspace Protocol (`workspace:*`)

### What It Is

pnpm workspaces use `workspace:*` for internal dependencies during development:

```json
{
  "dependencies": {
    "@scope/shared": "workspace:*"
  }
}
```

This resolves to the local workspace package, not a published npm version.

### The Problem

`workspace:*` cannot be published to npm — consumers can't resolve it.

### The Solution: Replace → Publish → Restore

```bash
# 1. Replace workspace:* with actual versions
pnpm tsx scripts/prepare-publish.ts
# @scope/shared: workspace:* → 0.2.16

# 2. Safety check
pnpm tsx scripts/validate-no-workspace-protocol.ts

# 3. Publish
npm publish

# 4. Restore originals
pnpm tsx scripts/restore-packages.ts
# @scope/shared: 0.2.16 → workspace:*
```

`prepare-publish.ts` creates `.backup` files for safe restoration.

## Dev (Pre-release) Versioning

### Strategy

For non-release builds (CI on main branch, workflow_dispatch):

```
base:  0.2.15
dev:   0.2.16-dev.12345678
              │    │
              │    └── GitHub Actions run_id (unique, monotonic)
              └── patch bumped
```

### Implementation

```typescript
// bump-dev-version.ts
const [major, minor, patch] = baseVersion.split('.').map(Number);
const devVersion = `${major}.${minor}.${patch + 1}-dev.${process.env.GITHUB_RUN_ID}`;
```

### npm Tag

```bash
# Dev builds
npm publish --tag dev

# Users install explicitly
npm install my-cli@dev

# Production (default)
npm publish          # tagged as 'latest' automatically
npm install my-cli   # gets latest
```

## Decision Tree

### When to Sync

```
Changed root package.json version?
  YES → Run sync-versions.ts
  NO  → No sync needed

Adding new workspace package?
  YES → Add to sync-versions.ts discovery
  NO  → Existing sync handles it

Publishing to npm?
  YES → Run prepare-publish → validate → publish → restore
  NO  → workspace:* is fine for development
```

### Choosing Version Bump

```
Breaking API change?         → major (1.0.0 → 2.0.0)
New feature, backwards-compat? → minor (0.2.0 → 0.3.0)
Bug fix, no API change?      → patch (0.2.15 → 0.2.16)
CI/testing build?            → dev   (0.2.15 → 0.2.16-dev.123)
```

## Troubleshooting

### Version mismatch between packages
```bash
# Check all versions
grep -r '"version"' packages/*/package.json
grep '^version' Cargo.toml

# Fix: sync from root
pnpm tsx scripts/sync-versions.ts
```

### workspace:* in published package
```bash
# Validate before publish
pnpm tsx scripts/validate-no-workspace-protocol.ts

# If already published, unpublish within 72h
npm unpublish @scope/pkg@version
```

### Cargo.toml version not updating
- Check regex matches: `version = "x.y.z"` (with spaces around `=`)
- Ensure Cargo.toml path is correct in config
- Note: Cargo doesn't support pre-release the same way npm does

## References

- [references/version-flow.md](./references/version-flow.md) — Detailed version propagation flow
- [references/workspace-protocol.md](./references/workspace-protocol.md) — Workspace protocol deep dive
- [references/pre-release-strategy.md](./references/pre-release-strategy.md) — Dev versioning strategy

## Setup & Activation

Install via forge:
```bash
lean-spec skill install codervisor/forge --skill monorepo-version-sync
```

Or place this folder in:
- `$PROJECT_ROOT/.github/skills/monorepo-version-sync/`
- `$PROJECT_ROOT/skills/monorepo-version-sync/`

- [references/version-flow.md](./references/version-flow.md) — How versions propagate
- [references/workspace-protocol.md](./references/workspace-protocol.md) — workspace:* lifecycle
- [references/pre-release-strategy.md](./references/pre-release-strategy.md) — Dev/canary/RC patterns

## Setup & Activation

Install via forge:
```bash
lean-spec skill install codervisor/forge --skill monorepo-version-sync
```

### Auto-activation hints
- `pnpm-workspace.yaml` or `lerna.json` or `turbo.json` present
- Multiple `package.json` files in subdirectories
- `scripts/*version*` or `scripts/*sync*` files exist
