# Version Flow Reference

Detailed walkthrough of how versions propagate through a polyglot monorepo.

## Single Source of Truth

```
root package.json (version: "0.2.15")
  │
  ├─ sync-versions.ts ──► packages/cli/package.json        → 0.2.15
  │                   ──► packages/sdk/package.json        → 0.2.15
  │                   ──► packages/shared/package.json     → 0.2.15
  │                   ──► Cargo.toml                       → 0.2.15
  │
  └─ generate-manifests ► platform-packages/*/package.json → 0.2.15
```

The root `package.json` version field is the canonical source. All other version
declarations are derived from it through automated scripts.

## Sync Flow (Development)

### Step 1: Bump Root Version

```bash
# One of:
npm version patch    # 0.2.15 → 0.2.16
npm version minor    # 0.2.15 → 0.3.0
npm version major    # 0.2.15 → 1.0.0
```

`npm version` updates `package.json` and creates a git tag.

### Step 2: Propagate to Workspace Packages

```bash
pnpm tsx scripts/sync-versions.ts
```

The sync script:
1. Reads `version` from root `package.json`
2. Finds all workspace packages via `pnpm-workspace.yaml` or `package.json` workspaces
3. Updates each workspace `package.json` with the root version
4. Updates `Cargo.toml` version field via regex replacement

### Step 3: Verify

```bash
# Check Node packages
grep '"version"' packages/*/package.json

# Check Rust
grep '^version' Cargo.toml
```

## Sync Flow (CI/CD)

### Dev Build (push to main / workflow_dispatch)

```
package.json: 0.2.15
       │
  compute-version action
       │
       ▼
  dev version: 0.2.16-dev.12345678
       │
  sync-versions.ts (with override)
       │
       ├──► packages/*/package.json → 0.2.16-dev.12345678
       └──► Cargo.toml             → 0.2.15 (no pre-release in Cargo)
```

Note: Cargo.toml stays at the base version because Cargo's semver doesn't
support npm-style pre-release identifiers in the same way.

### Production Release (GitHub release)

```
package.json: 0.2.16 (already bumped)
       │
  compute-version action (is-release: true)
       │
       ▼
  version: 0.2.16
       │
  sync-versions.ts
       │
       ├──► packages/*/package.json → 0.2.16
       └──► Cargo.toml             → 0.2.16
```

## Cargo.toml Version Sync

The sync script uses regex replacement for Cargo.toml:

```typescript
const cargoContent = readFileSync(cargoPath, 'utf8');
const updated = cargoContent.replace(
  /^version\s*=\s*"[^"]*"/m,
  `version = "${version}"`
);
writeFileSync(cargoPath, updated);
```

### Limitations

- Only updates the first `version = "..."` line matching the pattern
- For Cargo workspaces with multiple crates, the sync script should target
  the workspace `Cargo.toml` and use `workspace.package.version`
- Pre-release identifiers (e.g., `-dev.123`) are valid in Cargo but may cause
  issues with crates.io if you publish there

## Version Discovery

The sync script discovers packages to update via:

1. **pnpm workspace config** — `pnpm-workspace.yaml` or `package.json` workspaces field
2. **Cargo workspace config** — `[workspace]` members in `Cargo.toml`
3. **Explicit config** — `mainPackages` array in `publish.config.ts`

## Adding New Packages

When adding a new workspace package:

1. Add it to the workspace config (`pnpm-workspace.yaml` or `package.json`)
2. Run `sync-versions.ts` to set its initial version
3. The package will be automatically included in future syncs

## Troubleshooting

### Version mismatch after sync

```bash
# Check what sync-versions would do
grep -r '"version"' packages/*/package.json
grep '^version' Cargo.toml

# Re-run sync
pnpm tsx scripts/sync-versions.ts
```

### Cargo.toml not updating

- Ensure the regex pattern matches: `version = "x.y.z"` with spaces around `=`
- Check the Cargo.toml path in your config matches the actual location
- For workspace Cargo.toml, ensure you're targeting the root workspace file
