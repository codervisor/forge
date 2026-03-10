---
name: codervisor-forge
description: >
  Complete toolkit for building, testing, publishing, and versioning Rust+Node.js
  hybrid projects. Use when: (1) Starting a new Rust+Node.js project or scaffolding
  infrastructure, (2) Setting up CI/CD with GitHub Actions for Cargo+pnpm repos,
  (3) Publishing Rust binaries to npm via platform packages, (4) Managing coordinated
  versions across Node and Rust packages, (5) Working with workspace:* protocol,
  (6) Debugging publish pipeline, CI, or version sync failures. Triggers on keywords
  like "bootstrap", "scaffold", "publish", "version sync", "platform packages",
  "cross-compile", or any work involving both Cargo.toml and package.json.
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---

# Codervisor Forge

Complete toolkit for Rust+Node.js hybrid projects — from scaffolding to publishing.

## Domains

| Domain | What It Does |
|--------|-------------|
| **Bootstrap** | Scaffold a new project with CI, publishing, and versioning infrastructure |
| **CI/CD** | GitHub Actions workflows for build, test, and cross-platform compilation |
| **Publishing** | Distribute Rust binaries via npm platform packages (`optionalDependencies` pattern) |
| **Versioning** | Coordinated versions across Node.js and Rust packages in a monorepo |

## When to Use This Skill

Activate when any of the following are true:
- Starting a new Rust+Node.js project or adding infrastructure to an existing one
- Working with `.github/workflows/` in a repo with both `Cargo.toml` and `package.json`
- Publishing Rust binaries to npm or debugging publish pipeline failures
- Managing versions across workspace packages or `Cargo.toml`
- Working with pnpm `workspace:*` protocol
- Scripts matching `*publish*`, `*platform*`, `*version*`, or `*sync*` exist
- User says "bootstrap", "scaffold", "init", "set up a new project"

## Decision Tree

```
What does the user need?

Starting a new project or scaffolding?
  → Bootstrap section below
  → Full tree: references/project-structure.md
  → Verify: references/checklist.md

Setting up or fixing CI?
  → CI/CD section below
  → Workflow templates: templates/workflows/

Publishing Rust binaries to npm?
  → Publishing section below
  → Pipeline details: references/publish-pipeline.md
  → Platform config: references/platform-matrix.md

Managing versions?
  → Versioning section below
  → Strategy: references/version-strategy.md
  → Workspace protocol: references/workspace-protocol.md

Debugging a failure?
  → references/troubleshooting.md
```

## Bootstrap

Scaffold a new Rust+Node.js hybrid project with all forge infrastructure.

### Gather Project Info

| Field | Example | Required |
|-------|---------|----------|
| Project name | `my-tool` | Yes |
| npm scope | `@myorg` | Yes |
| Rust binary name(s) | `my-cli` | Yes |
| Cargo package name(s) | `my-cli-rs` | Yes |
| Main npm packages | `packages/cli` | Yes |
| Repository URL | `github.com/myorg/my-tool` | Yes |
| Platforms | `darwin-x64, darwin-arm64, linux-x64, windows-x64` | No (default: all 4) |

### Scaffold Structure

See [references/project-structure.md](./references/project-structure.md) for the full annotated tree.

```
my-tool/
├── .github/workflows/       ← CI + publish workflows
├── .lean-spec/config.json   ← LeanSpec configuration
├── specs/                   ← Spec-driven development
├── packages/cli/            ← Main npm package (thin JS wrapper)
│   ├── package.json         ← bin + optionalDependencies
│   └── bin.js               ← Resolves platform binary, spawns it
├── rust/                    ← Rust workspace
├── scripts/                 ← Publish & version scripts
├── publish.config.ts        ← Publish pipeline configuration
├── package.json             ← Root (version source of truth)
├── pnpm-workspace.yaml      ← pnpm workspace definition
└── Cargo.toml               ← Rust workspace manifest
```

### Generate Files (Order Matters)

1. **Root configs** — `package.json`, `pnpm-workspace.yaml`, `Cargo.toml`, `turbo.json`
   Use templates in [templates/bootstrap/](./templates/bootstrap/).
2. **Publish config** — `publish.config.ts` (drives script generation)
3. **Main package wrapper** — Copy `bin.js` + `package.json` from [templates/wrapper/](./templates/wrapper/),
   fill in scope/binary name/platforms
4. **Scripts** — Copy from [templates/scripts/](./templates/scripts/)
5. **Workflows** — Copy from [templates/workflows/](./templates/workflows/), customize matrix
6. **LeanSpec** — Initialize `.lean-spec/config.json` and `specs/`
7. **AGENTS.md** — Project-level agent instructions

### Verify

```bash
pnpm install && pnpm build && cargo check --workspace && pnpm tsx scripts/sync-versions.ts
```

See [references/checklist.md](./references/checklist.md) for the full post-bootstrap checklist.

### Install the LeanSpec Skill

After scaffolding, install the companion skill for spec-driven development:

```bash
npx skills add codervisor/lean-spec@leanspec-sdd -g -y
```

### Bootstrap Decision Tree

```
Starting from scratch?
  YES → Full scaffold (all steps above)
  NO  → Incremental setup ↓

Has package.json?     → NO: Create root package.json + pnpm-workspace.yaml
Has Cargo.toml?       → NO: Create Cargo workspace
Has .github/workflows? → NO: Generate from templates/workflows/
Has scripts/?         → NO: Copy from templates/scripts/
Has specs/?           → NO: Initialize LeanSpec
```

## CI/CD

Two-track CI for Rust+Node.js hybrid repos using GitHub Actions.

### Architecture

```
┌─────────────┐     ┌──────────────────┐
│  Node Build  │     │   Rust Build     │
│  (test/lint) │     │  (per platform)  │
└──────┬──────┘     └────────┬─────────┘
       │                     │
       │   ┌─────────────┐   │
       └──►│  Artifacts   │◄──┘
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │   Publish    │
           └─────────────┘
```

### Workflows

| Workflow | Trigger | What It Does |
|----------|---------|-------------|
| `ci.yml` | PR, push to main | Node build+test+lint, Rust fmt+clippy+test |
| `publish.yml` | Release, dispatch | Cross-build → publish to npm |
| `copilot-setup-steps.yml` | repository_dispatch | Copilot agent onboarding |

Templates: [templates/workflows/](./templates/workflows/)

### CI Jobs

**Node job:**
```yaml
steps:
  - uses: codervisor/forge/actions/setup-workspace@v1
  - run: pnpm build
  - run: pnpm test
  - run: pnpm typecheck
```

**Rust job:**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: dtolnay/rust-toolchain@stable
    with:
      components: clippy, rustfmt
  - run: cargo fmt --all -- --check
  - run: cargo clippy --workspace -- -D warnings
  - run: cargo test --workspace
```

### Caching

- **pnpm**: `actions/setup-node@v4` with `cache: 'pnpm'`
- **Rust**: `Swatinem/rust-cache@v2`
- **Turbo**: `actions/cache@v4` on `.turbo` path

### Reusable Actions

| Action | Purpose |
|--------|---------|
| `codervisor/forge/actions/setup-workspace@v1` | pnpm + Node.js setup |
| `codervisor/forge/actions/rust-cross-build@v1` | Cross-platform Rust compilation |
| `codervisor/forge/actions/compute-version@v1` | Dev/release version computation |
| `codervisor/forge/actions/wait-npm-propagation@v1` | Wait for npm registry propagation |

### Publish Workflow Matrix

```yaml
strategy:
  matrix:
    include:
      - { os: macos-latest,   target: x86_64-apple-darwin,      platform: darwin-x64 }
      - { os: macos-latest,   target: aarch64-apple-darwin,     platform: darwin-arm64 }
      - { os: ubuntu-22.04,   target: x86_64-unknown-linux-gnu, platform: linux-x64 }
      - { os: windows-latest, target: x86_64-pc-windows-msvc,   platform: windows-x64 }
```

### Artifact Flow

```yaml
# Upload from build job
- uses: actions/upload-artifact@v4
  with:
    name: binary-${{ matrix.platform }}
    path: target/${{ matrix.target }}/release/my-cli${{ matrix.platform == 'windows-x64' && '.exe' || '' }}

# Download in publish job
- uses: actions/download-artifact@v4
  with:
    pattern: binary-*
    path: artifacts/
    merge-multiple: false
```

## Publishing

Distribute Rust binaries via npm using the `optionalDependencies` platform package pattern
(same approach used by SWC, Turbopack, and similar tools).

### The Pattern

```
@scope/my-tool                    ← main package (thin JS wrapper + bin.js)
├── optionalDependencies:
│   ├── @scope/my-tool-darwin-arm64   ← macOS ARM (M-series)
│   ├── @scope/my-tool-darwin-x64     ← macOS Intel
│   ├── @scope/my-tool-linux-x64      ← Linux x86_64
│   └── @scope/my-tool-windows-x64    ← Windows x86_64
```

Each platform package contains **only** the pre-compiled binary for that target.
npm installs only the one matching the user's OS/CPU.

### Configuration

Each repo provides a `publish.config.ts` (see [examples/](./examples/) for real configs):

```typescript
export default {
  scope: '@myorg',
  binaries: [{ name: 'my-cli', scope: 'cli', cargoPackage: 'my-cli-rs' }],
  platforms: ['darwin-x64', 'darwin-arm64', 'linux-x64', 'windows-x64'],
  mainPackages: [{ path: 'packages/cli', name: 'my-cli' }],
  cargoWorkspace: 'Cargo.toml',
  repositoryUrl: 'https://github.com/myorg/my-project',
};
```

### Publish Pipeline

```
sync-versions → generate-manifests → add-platform-deps → copy-binaries
→ validate-binaries → prepare-publish → validate-workspace → publish-platforms
→ wait-propagation → publish-main → restore-packages
```

**Critical ordering**: Platform packages MUST be published and propagated on npm
before main packages, because main packages reference them as `optionalDependencies`.

See [references/publish-pipeline.md](./references/publish-pipeline.md) for step-by-step details.

### Main Package Wrapper

The main npm package is a **thin JS wrapper** — `bin.js` resolves the correct
platform binary and spawns it. See [templates/wrapper/](./templates/wrapper/) for the template.

Key details:
- `process.platform` returns `win32` (not `windows`), so map `win32-x64` → `@scope/cli-windows-x64`
- Use `require.resolve('pkg/package.json')` to find the platform package, then read `main` for the binary filename
- Use `execFileSync` and forward exit codes from the Rust binary
- The main package has NO `os`/`cpu` fields — it installs everywhere. Only platform packages use those.

### Platform Package Manifests

Each platform package needs `os` and `cpu` fields plus a `postinstall.js` for chmod:

```json
{
  "name": "@scope/cli-darwin-arm64",
  "os": ["darwin"],
  "cpu": ["arm64"],
  "main": "my-cli"
}
```

### Adding a New Platform

1. Add to `platforms` array in `publish.config.ts`
2. Add Rust target: `rustup target add <target-triple>`
3. Add to CI matrix in publish workflow
4. Regenerate manifests: `pnpm tsx scripts/generate-platform-manifests.ts`

See [references/platform-matrix.md](./references/platform-matrix.md) for the full platform reference.

## Versioning

Root `package.json` is the **single source of truth** for version. Everything derives from it.

```
root package.json (version: "0.2.15")
  ├── packages/cli/package.json        → 0.2.15
  ├── packages/sdk/package.json        → 0.2.15
  ├── Cargo.toml                       → 0.2.15
  └── platform-packages/*/package.json → 0.2.15
```

**Never manually edit** version in child packages or `Cargo.toml`. Always update root, then sync.

### Version Sync Flow

```bash
npm version patch                     # Bump root: 0.2.15 → 0.2.16
pnpm tsx scripts/sync-versions.ts     # Propagate to all packages + Cargo.toml
```

### Dev (Pre-release) Versioning

For non-release builds: `0.2.15` → `0.2.16-dev.{github_run_id}`
- Bumps patch, appends `-dev.{run_id}` for unique, deterministic pre-release versions
- Published with `--tag dev` on npm (`npm install my-cli@dev`)

### Workspace Protocol (`workspace:*`)

pnpm uses `workspace:*` for internal dependencies during development. These MUST be
replaced with actual version numbers before publishing to npm:

```bash
pnpm tsx scripts/prepare-publish.ts                  # Replace workspace:* → real versions
pnpm tsx scripts/validate-no-workspace-protocol.ts   # Safety check
npm publish                                          # Publish
pnpm tsx scripts/restore-packages.ts                 # Restore workspace:*
```

### Version Bump Guide

| Change Type | Command | Example |
|-------------|---------|---------|
| Breaking API change | `npm version major` | 1.0.0 → 2.0.0 |
| New feature, backwards-compat | `npm version minor` | 0.2.0 → 0.3.0 |
| Bug fix | `npm version patch` | 0.2.15 → 0.2.16 |
| CI/testing build | Automatic | 0.2.15 → 0.2.16-dev.123 |

See [references/version-strategy.md](./references/version-strategy.md) for the full strategy.
See [references/workspace-protocol.md](./references/workspace-protocol.md) for protocol details.

## Platform Matrix

| Platform | Rust Target | OS/CPU Fields | Binary Extension |
|----------|-------------|---------------|-----------------|
| `darwin-arm64` | `aarch64-apple-darwin` | `darwin` / `arm64` | (none) |
| `darwin-x64` | `x86_64-apple-darwin` | `darwin` / `x64` | (none) |
| `linux-x64` | `x86_64-unknown-linux-gnu` | `linux` / `x64` | (none) |
| `windows-x64` | `x86_64-pc-windows-msvc` | `win32` / `x64` | `.exe` |

See [references/platform-matrix.md](./references/platform-matrix.md) for adding new platforms and binary validation.

## Troubleshooting Quick Reference

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `Unsupported platform` | Missing platform in bin.js | Add platform key mapping |
| Platform pkg not found on npm | Registry propagation delay | Wait; check publish logs |
| `workspace:*` in published pkg | prepare-publish didn't run | Run prepare-publish.ts |
| Binary not executable | postinstall didn't run | `chmod +x` the binary |
| Version mismatch | Forgot to sync | Run sync-versions.ts |
| CI Rust build fails on ARM | Cross-compilation issue | Check target + toolchain |
| pnpm lockfile mismatch | Local vs CI divergence | `pnpm install --no-frozen-lockfile` locally |

See [references/troubleshooting.md](./references/troubleshooting.md) for detailed diagnostics and fixes.

## Templates

| Directory | Contents | Used By |
|-----------|----------|---------|
| [templates/bootstrap/](./templates/bootstrap/) | Root configs (`package.json`, `Cargo.toml`, etc.) | Bootstrap |
| [templates/workflows/](./templates/workflows/) | CI, publish, copilot-setup workflow YAMLs | CI/CD |
| [templates/actions/](./templates/actions/) | Composite action READMEs | CI/CD |
| [templates/scripts/](./templates/scripts/) | Publish + version pipeline scripts | Publishing, Versioning |
| [templates/wrapper/](./templates/wrapper/) | npm CLI wrapper (`bin.js` + `package.json`) | Publishing |
| [examples/](./examples/) | Real-world `publish.config.ts` examples | Publishing |

## References

| Reference | What's Inside |
|-----------|--------------|
| [project-structure.md](./references/project-structure.md) | Full project tree with directory explanations |
| [checklist.md](./references/checklist.md) | Post-bootstrap verification checklist |
| [platform-matrix.md](./references/platform-matrix.md) | Platform config, binary validation, adding targets |
| [publish-pipeline.md](./references/publish-pipeline.md) | Step-by-step pipeline with scripts and env vars |
| [version-strategy.md](./references/version-strategy.md) | Version sync, dev builds, npm tags, Cargo handling |
| [workspace-protocol.md](./references/workspace-protocol.md) | `workspace:*` lifecycle and publish flow |
| [troubleshooting.md](./references/troubleshooting.md) | Common failures, diagnostics, and fixes |

## Setup & Activation

Install via forge:
```bash
npx skills add codervisor/forge@codervisor-forge -g -y
```

### Auto-activation hints
- Both `Cargo.toml` and `package.json` present at root
- `.github/workflows/` directory exists
- `pnpm-workspace.yaml` present
- `scripts/*publish*` or `scripts/*platform*` files exist
- User mentions "bootstrap", "scaffold", "publish", "version sync"
