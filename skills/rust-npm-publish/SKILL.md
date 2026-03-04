---
name: rust-npm-publish
description: >
  Distribute Rust binaries via npm platform packages using the optionalDependencies
  pattern. Use when: (1) Publishing Rust CLI tools to npm, (2) Setting up cross-platform
  binary distribution, (3) Debugging publish pipeline failures, (4) Adding new platform
  targets, (5) Working with scripts matching *publish* or *platform* in a Rust+Node project.
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---

# Rust npm Publish

Teach agents how to distribute Rust-compiled binaries via npm using the platform
package pattern. This is the same pattern used by tools like SWC, Turbopack, and
similar Rust-to-npm distribution pipelines.

## When to Use This Skill

Activate when any of the following are true:
- The repository has both `Cargo.toml` and `package.json` at root
- Scripts directory contains `*publish*` or `*platform*` files
- The user asks about publishing Rust binaries to npm
- Platform-specific npm packages exist (`@scope/cli-darwin-arm64`, etc.)

## The Pattern

Instead of shipping one npm package with pre-built binaries for all platforms, publish
**platform-specific packages** as `optionalDependencies`. npm installs only the one
matching the user's OS/CPU.

```
@scope/my-tool                    ← main package (thin JS wrapper + bin.js)
├── bin.js                        ← resolves platform binary, spawns it
├── optionalDependencies:
│   ├── @scope/my-tool-darwin-arm64   ← macOS ARM (M-series)
│   ├── @scope/my-tool-darwin-x64     ← macOS Intel
│   ├── @scope/my-tool-linux-x64      ← Linux x86_64
│   └── @scope/my-tool-windows-x64    ← Windows x86_64
```

Each platform package contains **only** the pre-compiled binary for that target.

## Publish Pipeline

```
sync-versions          ← Propagate version to all packages + Cargo.toml
       ↓
generate-manifests     ← Create package.json + postinstall.js per platform
       ↓
add-platform-deps      ← Add optionalDependencies to main package(s)
       ↓
copy-binaries          ← Copy compiled Rust binaries to platform package dirs
       ↓
validate-binaries      ← Check binary headers (Mach-O, ELF, PE)
       ↓
prepare-publish        ← Replace workspace:* with real versions, create backups
       ↓
validate-workspace     ← Ensure no workspace:* references remain
       ↓
publish-platforms      ← Publish all platform packages (parallel)
       ↓
wait-propagation       ← Poll npm registry until packages are visible
       ↓
publish-main           ← Publish main package(s) with optionalDependencies
       ↓
restore-packages       ← Revert workspace:* replacements from backups
```

**Critical ordering**: Platform packages MUST be published and propagated on npm
before main packages, because main packages reference them as optionalDependencies.

## Configuration

Each consuming repo provides a `publish.config.ts`:

```typescript
import type { PublishConfig } from '@codervisor/forge';

export default {
  // npm scope for all packages
  scope: '@myorg',

  // Rust binaries to distribute
  binaries: [
    { name: 'my-cli', scope: 'cli', cargoPackage: 'my-cli-rs' },
    // Multiple binaries supported:
    // { name: 'my-mcp', scope: 'mcp', cargoPackage: 'my-mcp-rs' },
  ],

  // Target platforms
  platforms: ['darwin-x64', 'darwin-arm64', 'linux-x64', 'windows-x64'],

  // Main packages to publish after platform packages
  mainPackages: [
    { path: 'packages/cli', name: 'my-cli' },
  ],

  // Rust workspace root (for version syncing)
  cargoWorkspace: 'Cargo.toml',

  // Repository URL (for package.json metadata)
  repositoryUrl: 'https://github.com/myorg/my-project',
} satisfies PublishConfig;
```

## Platform Matrix

| Platform Key | OS | CPU | Rust Target | Binary Extension |
|-------------|-----|-----|-------------|-----------------|
| `darwin-arm64` | macOS | Apple Silicon | `aarch64-apple-darwin` | (none) |
| `darwin-x64` | macOS | Intel | `x86_64-apple-darwin` | (none) |
| `linux-x64` | Linux | x86_64 | `x86_64-unknown-linux-gnu` | (none) |
| `windows-x64` | Windows | x86_64 | `x86_64-pc-windows-msvc` | `.exe` |

## Main Package Wrapper

The main npm package is a **thin JS wrapper** — it contains no Rust code, only a
`bin.js` that resolves the correct platform binary and spawns it. This is what makes
`npx my-tool` work.

Use the templates in `templates/wrapper/` as starting points.

### Structure

```
packages/cli/
├── package.json     ← "bin": { "my-cli": "bin.js" }, optionalDependencies
└── bin.js           ← Resolves platform binary, executes with process.argv
```

### bin.js Pattern

The bin entry point maps `process.platform` + `process.arch` to the correct
platform package, resolves the binary path, and spawns it:

```javascript
const { execFileSync } = require('child_process');
const { join } = require('path');

const PLATFORMS = {
  'darwin-arm64': '@scope/cli-darwin-arm64',
  'darwin-x64':   '@scope/cli-darwin-x64',
  'linux-x64':    '@scope/cli-linux-x64',
  'win32-x64':    '@scope/cli-windows-x64',
};

const platformKey = `${process.platform}-${process.arch}`;
const packageName = PLATFORMS[platformKey];

if (!packageName) {
  console.error(`Unsupported platform: ${platformKey}`);
  process.exit(1);
}

const pkgDir = join(require.resolve(`${packageName}/package.json`), '..');
const pkgMeta = require(`${packageName}/package.json`);
const binary = join(pkgDir, pkgMeta.main);

try {
  execFileSync(binary, process.argv.slice(2), { stdio: 'inherit' });
} catch (error) {
  if (error.status !== null) process.exit(error.status);
  throw error;
}
```

### Main package.json

The main package must have `"bin"` pointing to the wrapper and platform packages
as `optionalDependencies` (added by `add-platform-deps.ts`):

```json
{
  "name": "@scope/cli",
  "bin": { "my-cli": "bin.js" },
  "files": ["bin.js"],
  "optionalDependencies": {
    "@scope/cli-darwin-arm64": "0.1.0",
    "@scope/cli-darwin-x64": "0.1.0",
    "@scope/cli-linux-x64": "0.1.0",
    "@scope/cli-windows-x64": "0.1.0"
  }
}
```

### Key Details

- **Platform key mapping**: `process.platform` returns `win32` (not `windows`), so
  the lookup table maps `win32-x64` → `@scope/cli-windows-x64`
- **Binary resolution**: Use `require.resolve('pkg/package.json')` to find the
  platform package directory, then read `main` from its `package.json` to get the
  binary filename
- **Exit code forwarding**: `execFileSync` throws on non-zero exit — catch it and
  forward `error.status` to preserve the Rust binary's exit code
- **No platform detection in package.json**: The main package has NO `os`/`cpu`
  fields — it installs everywhere. Only the platform packages use `os`/`cpu`

## Key Concepts

### Platform Package Manifests

Each platform package needs a `package.json` with `os` and `cpu` fields:

```json
{
  "name": "@scope/cli-darwin-arm64",
  "os": ["darwin"],
  "cpu": ["arm64"],
  "main": "my-cli"
}
```

And a `postinstall.js` that makes the binary executable (chmod 755 on Unix, no-op on Windows).

### Workspace Protocol

pnpm workspaces use `workspace:*` for internal dependencies. These MUST be replaced
with actual version numbers before publishing to npm. The prepare-publish script
handles this replacement and creates `.backup` files for restoration.

### Version Syncing

Root `package.json` is the **single source of truth** for version. Scripts propagate
this version to:
- All workspace `package.json` files
- `Cargo.toml` (via regex replacement)
- Platform package manifests

### Dev Versioning

For non-release builds: `0.2.15` → `0.2.16-dev.{github_run_id}`
- Bumps patch, appends `-dev.{id}` for deterministic, unique pre-release versions
- Published with `--tag dev` on npm

### Binary Validation

Before publishing, validate binary files:
- **darwin**: Mach-O magic bytes (`0xCFFA EDFE` or `0xFEED FACF`)
- **linux**: ELF header (`0x7F454C46`)
- **windows**: PE/MZ header (`0x4D5A`)

## Troubleshooting

### `npx my-tool` fails with "Unsupported platform"
- The wrapper's `PLATFORMS` map doesn't include the user's `process.platform`-`process.arch`
- Check with: `node -e "console.log(process.platform, process.arch)"`
- Add the missing platform key to `bin.js` and a matching platform package

### Platform package not installed / "Failed to find package"
- `optionalDependencies` with `os`/`cpu` filtering failed to install the right one
- Check with: `ls node_modules/@scope/cli-*`
- Manual fix: `npm install @scope/cli-darwin-arm64`

### Platform package not found on npm
- npm registry propagation takes 10-60 seconds
- The wait-propagation script retries with exponential backoff (up to 20 attempts)
- Check with: `npm view @scope/cli-darwin-arm64@version`

### workspace:* leaked into published package
- `validate-no-workspace-protocol.ts` should catch this pre-publish
- Fix: run `prepare-publish.ts` to replace, then `restore-packages.ts` after

### Binary not executable after install
- Platform package postinstall.js should chmod 755
- Check if postinstall ran: `npm ls @scope/cli-darwin-arm64`
- Manual fix: `chmod +x node_modules/@scope/cli-darwin-arm64/my-cli`

### Wrong binary for platform
- Check `os` and `cpu` fields in platform package.json
- npm uses these to filter optionalDependencies

## Adding a New Platform

1. Add to `platforms` array in `publish.config.ts`
2. Add Rust target: `rustup target add <target-triple>`
3. Add to CI matrix in publish workflow
4. Generate new manifests: run `generate-platform-manifests.ts`
5. Update `add-platform-deps.ts` to include new optionalDependency
6. Test with: `cargo build --target <target-triple>`

## References

- [references/publish-pipeline.md](./references/publish-pipeline.md) — Detailed pipeline steps
- [references/platform-matrix.md](./references/platform-matrix.md) — Platform configuration reference
- [references/version-strategy.md](./references/version-strategy.md) — Dev/stable versioning
- [references/troubleshooting.md](./references/troubleshooting.md) — Common failures and fixes

## Setup & Activation

Install via forge:
```bash
lean-spec skill install codervisor/forge --skill rust-npm-publish
```

Or place this folder in your project's skills directory.

### Auto-activation hints
- `Cargo.toml` + `package.json` both present
- `scripts/*publish*` files exist
- `scripts/*platform*` files exist

## Compatibility

- Works with pnpm, npm, or yarn workspaces
- Requires Rust toolchain for cross-compilation
- GitHub Actions recommended for CI (templates provided)
- Template scripts are TypeScript (requires `tsx` or `ts-node`)
