---
name: hybrid-ci
description: >
  CI/CD patterns for Rust+Node.js hybrid projects using GitHub Actions. Use when:
  (1) Setting up CI for a project with both Cargo.toml and package.json,
  (2) Configuring cross-platform Rust builds in GitHub Actions,
  (3) Debugging CI failures in hybrid builds, (4) Setting up Copilot/AI agent
  onboarding steps, (5) Working with .github/workflows/ in Rust+Node repos.
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---

# Hybrid CI

Teach agents how to set up and maintain CI/CD pipelines for projects that combine
Rust and Node.js, built with GitHub Actions.

## When to Use This Skill

Activate when any of the following are true:
- The repository has both `Cargo.toml` and `package.json`
- Working with `.github/workflows/` in a Rust+Node project
- Setting up cross-platform builds or CI pipelines
- Debugging CI failures involving Rust or pnpm

## Architecture

A typical hybrid CI has two parallel build tracks that merge at publish time:

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

### CI Workflow (build + test)

Triggered on PR and push to main:

```yaml
jobs:
  node:
    # TypeScript build, lint, test
    steps:
      - uses: codervisor/forge/actions/setup-workspace@v1
      - run: pnpm build
      - run: pnpm test
      - run: pnpm typecheck

  rust:
    # Cargo build, test, clippy, fmt
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      - run: cargo fmt --all -- --check
      - run: cargo clippy --workspace -- -D warnings
      - run: cargo test --workspace
```

### Publish Workflow

Triggered on release or workflow_dispatch:

```yaml
jobs:
  rust-binaries:
    strategy:
      matrix:
        include:
          - { os: macos-latest,    target: x86_64-apple-darwin,      platform: darwin-x64 }
          - { os: macos-latest,    target: aarch64-apple-darwin,     platform: darwin-arm64 }
          - { os: ubuntu-22.04,    target: x86_64-unknown-linux-gnu, platform: linux-x64 }
          - { os: windows-latest,  target: x86_64-pc-windows-msvc,   platform: windows-x64 }
    steps:
      - uses: codervisor/forge/actions/rust-cross-build@v1
        with:
          targets: ${{ matrix.target }}
          packages: my-cli

  publish-platform:
    needs: rust-binaries
    # Download artifacts, generate manifests, publish platform packages

  publish-main:
    needs: publish-platform
    # Wait for propagation, publish main packages
```

## Caching Strategy

### Node (pnpm)
```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'pnpm'
```

### Rust (cargo)
```yaml
# Option A: Swatinem action (recommended)
- uses: Swatinem/rust-cache@v2

# Option B: Manual caching
- uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/registry
      ~/.cargo/git
      target
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```

### Turbo (if using turborepo)
```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## Copilot Setup Steps

The `copilot-setup-steps.yml` workflow lets GitHub Copilot build and use
your tools when assisting with code:

```yaml
name: "Copilot Setup Steps"
on: repository_dispatch

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - run: pnpm build
      - run: npm install -g ./packages/cli  # Make CLI available
```

## Artifact Flow Between Jobs

### Upload from build job
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: binary-${{ matrix.platform }}
    path: target/${{ matrix.target }}/release/my-cli${{ matrix.platform == 'windows-x64' && '.exe' || '' }}
```

### Download in publish job
```yaml
- uses: actions/download-artifact@v4
  with:
    pattern: binary-*
    path: artifacts/
    merge-multiple: false
```

## Troubleshooting

### Rust build fails on macOS ARM
- Use `macos-latest` (supports both x64 and arm64)
- For cross-compilation: `rustup target add aarch64-apple-darwin`

### pnpm lockfile mismatch
- Always use `--frozen-lockfile` in CI
- Regenerate: `pnpm install --no-frozen-lockfile` locally, commit lockfile

### Cargo cache too large
- Add `shared-key` to Swatinem/rust-cache for cross-job sharing
- Use `save-if: ${{ github.ref == 'refs/heads/main' }}` to only cache on main

### Artifact not found in downstream job
- Check `needs:` dependency chain
- Verify artifact name matches between upload and download
- Check `pattern` vs `name` in download action

## References

- [templates/workflows/ci.yml](./templates/workflows/ci.yml) — CI workflow template
- [templates/workflows/publish.yml](./templates/workflows/publish.yml) — Publish workflow template
- [templates/workflows/copilot-setup-steps.yml](./templates/workflows/copilot-setup-steps.yml) — Copilot setup template

## Setup & Activation

Install via forge:
```bash
lean-spec skill install codervisor/forge --skill hybrid-ci
```

Or place this folder in:
- `$PROJECT_ROOT/.github/skills/hybrid-ci/`
- `$PROJECT_ROOT/skills/hybrid-ci/`

See templates/ for ready-to-use workflow files:
- [templates/workflows/ci.yml](./templates/workflows/ci.yml) — CI workflow
- [templates/workflows/publish.yml](./templates/workflows/publish.yml) — Publish workflow
- [templates/workflows/copilot-setup-steps.yml](./templates/workflows/copilot-setup-steps.yml) — Copilot onboarding
- [templates/actions/](./templates/actions/) — Composite actions

## Setup & Activation

Install via forge:
```bash
lean-spec skill install codervisor/forge --skill hybrid-ci
```

### Auto-activation hints
- `.github/workflows/` directory exists
- Both `Cargo.toml` and `package.json` present
- `pnpm-workspace.yaml` present
