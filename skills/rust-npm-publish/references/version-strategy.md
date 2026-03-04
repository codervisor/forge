# Version Strategy Reference

## Source of Truth

The root `package.json` version is the **single source of truth**.
All other version declarations are derived from it.

```
root package.json (version: "0.2.15")
  ├── packages/*/package.json     ← sync-versions.ts
  ├── Cargo.toml                  ← sync-versions.ts (regex)
  └── platform packages           ← generate-platform-manifests.ts
```

## Release Types

### Production Release
```bash
# 1. Bump version in root package.json
npm version patch   # 0.2.15 → 0.2.16
# or: npm version minor / npm version major

# 2. Push tag (triggers publish workflow)
git push --follow-tags
```

Published with `--tag latest` (npm default).

### Dev (Pre-release)
Triggered by workflow_dispatch or push to main.

Version formula: bump patch + append `-dev.{run_id}`
```
0.2.15 → 0.2.16-dev.12345678
```

Published with `--tag dev`:
```bash
npm publish --tag dev
```

Users install dev builds explicitly:
```bash
npm install my-cli@dev
```

### Why `-dev.{run_id}`?

- **Deterministic**: Same CI run always produces same version
- **Unique**: No collisions between runs
- **Sortable**: Higher run_id = newer build
- **npm-compatible**: Valid semver pre-release identifier

## Version Sync Flow

### Node Packages
```typescript
// sync-versions.ts reads root version
const rootVersion = rootPkg.version;

// Writes to each workspace package
for (const pkg of workspacePackages) {
  pkg.version = rootVersion;
  writeFileSync(pkg.path, JSON.stringify(pkg, null, 2));
}
```

### Rust (Cargo.toml)
```typescript
// Regex replacement in Cargo.toml
const cargoContent = readFileSync('Cargo.toml', 'utf8');
const updated = cargoContent.replace(
  /^version\s*=\s*"[^"]*"/m,
  `version = "${rootVersion}"`
);
```

**Note**: Cargo.toml doesn't support pre-release identifiers the same way npm does.
For dev builds, Cargo version stays at the base version while npm gets the `-dev.X` suffix.

## Workspace Protocol Lifecycle

pnpm uses `workspace:*` for internal dependencies during development:

```json
{
  "dependencies": {
    "@scope/shared": "workspace:*"
  }
}
```

**Before publish**: Replace with actual version:
```json
{
  "dependencies": {
    "@scope/shared": "0.2.16"
  }
}
```

**After publish**: Restore original:
```json
{
  "dependencies": {
    "@scope/shared": "workspace:*"
  }
}
```

This is handled by `prepare-publish.ts` and `restore-packages.ts`.

## npm Tag Strategy

| Scenario | Version | npm Tag | Install Command |
|----------|---------|---------|-----------------|
| Production | `0.2.16` | `latest` | `npm install my-cli` |
| Dev build | `0.2.17-dev.123` | `dev` | `npm install my-cli@dev` |
| Release candidate | `0.3.0-rc.1` | `next` | `npm install my-cli@next` |

## Verification

After publishing, verify packages:

```bash
# Check latest version
npm view @scope/my-cli version

# Check dev version
npm view @scope/my-cli dist-tags.dev

# Check platform package
npm view @scope/my-cli-darwin-arm64 version

# Verify optionalDependencies resolve
npm pack @scope/my-cli --dry-run
```
