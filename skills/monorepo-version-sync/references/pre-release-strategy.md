# Pre-release Strategy Reference

How to manage dev (pre-release) versions in a polyglot monorepo.

## Dev Version Format

```
{major}.{minor}.{patch+1}-dev.{github_run_id}
```

Example: `0.2.15` → `0.2.16-dev.12345678`

### Why This Format?

- **Patch bump**: Ensures dev versions sort higher than the current release
- **`-dev.` prefix**: Clear pre-release identifier (valid semver)
- **`run_id` suffix**: GitHub Actions run ID is unique and monotonically increasing
- **Deterministic**: Same CI run always produces the same version
- **No collisions**: Each CI run has a unique run ID

## Computing Dev Versions

### In GitHub Actions

Use the `compute-version` action:

```yaml
- uses: codervisor/forge/actions/compute-version@v1
  id: version
  with:
    base-version: '0.2.15'
    is-release: 'false'
# Outputs: version=0.2.16-dev.12345678, npm-tag=dev
```

### In Scripts

```typescript
function computeDevVersion(baseVersion: string, runId: string): string {
  const [major, minor, patch] = baseVersion.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}-dev.${runId}`;
}
```

## npm Tags

npm uses dist-tags to manage version channels:

| Tag | Purpose | Install Command |
|-----|---------|-----------------|
| `latest` | Production releases (default) | `npm install my-cli` |
| `dev` | Dev/pre-release builds | `npm install my-cli@dev` |
| `next` | Release candidates | `npm install my-cli@next` |

### Publishing with Tags

```bash
# Dev build
npm publish --tag dev

# Production (latest is the default tag)
npm publish

# Release candidate
npm publish --tag next
```

### Checking Tags

```bash
# See all dist-tags
npm view my-cli dist-tags

# See specific tag
npm view my-cli dist-tags.dev
```

## Cargo vs npm Pre-release

Cargo and npm handle pre-release identifiers differently:

| Feature | npm (semver) | Cargo (semver) |
|---------|-------------|----------------|
| Format | `0.2.16-dev.12345678` | `0.2.16-dev.12345678` |
| Sort order | Correct | Correct |
| Registry support | Full | Full (crates.io) |
| Workspace support | Full | Limited |

### Recommended Approach

- **npm packages**: Use full dev version with suffix (`0.2.16-dev.12345678`)
- **Cargo.toml**: Keep at base version (`0.2.15`) for dev builds

This avoids Cargo workspace complications while keeping npm versions precise.

## When to Use Dev Versions

```
Push to main branch?
  YES → Dev version (automatic via CI)
  NO  → No publish needed

Manual workflow_dispatch?
  YES → Dev version (unless is-release=true)
  NO  → Triggered by other event

GitHub Release created?
  YES → Production version (from package.json)
  NO  → Dev version
```

## Version Ordering

Dev versions sort correctly in semver:

```
0.2.15              ← current release
0.2.16-dev.100      ← first dev build after release
0.2.16-dev.101      ← next dev build
0.2.16-dev.200      ← later dev build
0.2.16              ← next release (higher than all dev builds)
```

This ensures:
- Dev builds are always "newer" than the current release
- The next release is always "newer" than dev builds
- DevDev builds sort chronologically by run ID

## CI Integration

### Trigger-based version selection

```yaml
jobs:
  publish:
    steps:
      - uses: codervisor/forge/actions/compute-version@v1
        id: version
        with:
          base-version: ${{ steps.pkg.outputs.version }}
          is-release: ${{ github.event_name == 'release' }}

      # version.outputs.version will be:
      #   release event  → "0.2.16" (production)
      #   other events   → "0.2.17-dev.12345678" (dev)
```

### Using the computed version

```yaml
      - name: Sync version
        run: pnpm tsx scripts/sync-versions.ts --version ${{ steps.version.outputs.version }}

      - name: Publish
        run: npm publish --tag ${{ steps.version.outputs.npm-tag }}
```

## Cleanup

Old dev versions accumulate on npm over time. Consider periodically deprecating
old dev builds:

```bash
# Deprecate old dev versions
npm deprecate "my-cli@0.2.16-dev.*" "Old dev build, use latest"
```

Or use `npm unpublish` for versions less than 72 hours old.
