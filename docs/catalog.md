# Forge Catalog

Complete guide to all skills and actions in the forge shared skills repository.

## Consuming Projects

| Project | Repository | Skills Used |
|---------|------------|-------------|
| Ising | [`codervisor/ising`](https://github.com/codervisor/ising) | `codervisor-forge` |
| Cueless | [`codervisor/cueless`](https://github.com/codervisor/cueless) | `codervisor-forge` |
| Synodic | [`codervisor/synodic`](https://github.com/codervisor/synodic) | `codervisor-forge` |

## Skills

Skills are agent-teachable knowledge bundles. Install them into your project
so AI agents can use them during development.

### codervisor-forge

**Complete toolkit: bootstrap, CI/CD, npm publishing, and versioning for Rust+Node.js hybrid projects.**

| Attribute | Value |
|-----------|-------|
| Status | Complete |
| Audience | Rust+Node.js hybrid projects |
| Requirements | None |
| Directory | [`skills/codervisor-forge/`](../skills/codervisor-forge/) |

**Use when:** Starting a new Rust+Node.js project, setting up CI/CD, publishing
Rust binaries to npm, managing monorepo versions, or debugging pipeline failures.

**Covers four domains:**
- **Bootstrap** — Scaffold a new project with all infrastructure
- **CI/CD** — GitHub Actions workflows for build, test, cross-compilation
- **Publishing** — Distribute Rust binaries via npm platform packages
- **Versioning** — Coordinated versions across Node.js and Rust packages

**Includes:**
- SKILL.md — Decision tree, all four domains, platform matrix, troubleshooting
- 7 reference docs — project structure, checklist, platform matrix, publish pipeline, version strategy, workspace protocol, troubleshooting
- Templates — Root configs, workflow YAMLs, action READMEs, publish scripts, CLI wrapper
- 2 examples — Real publish.config.ts from clawden and lean-spec projects

> **Note:** The `leanspec-sdd` skill has moved to [`codervisor/lean-spec`](https://github.com/codervisor/lean-spec).

---

## Actions

Reusable GitHub Actions composite actions. Reference directly in workflows:

```yaml
- uses: codervisor/forge/actions/<name>@v1
```

### setup-workspace

**Checkout + pnpm + Node.js + cache + install.**

```yaml
- uses: codervisor/forge/actions/setup-workspace@v1
  with:
    node-version: '22'        # default: '22'
    install-args: '--frozen-lockfile'  # default
```

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `node-version` | No | `22` | Node.js version |
| `pnpm-version` | No | (from packageManager) | pnpm version |
| `install-args` | No | `--frozen-lockfile` | Extra pnpm install args |

---

### compute-version

**Compute effective version and npm tag for dev or production releases.**

```yaml
- uses: codervisor/forge/actions/compute-version@v1
  id: version
  with:
    base-version: '0.2.15'
    is-release: 'false'
# Outputs: version, npm-tag, is-dev
```

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `base-version` | Yes | — | Base version from package.json |
| `is-release` | No | `false` | Production release flag |
| `run-id` | No | `${{ github.run_id }}` | Run ID for dev suffix |

| Output | Description |
|--------|-------------|
| `version` | Computed version (e.g., `0.2.16-dev.12345`) |
| `npm-tag` | npm dist-tag (`latest` or `dev`) |
| `is-dev` | Whether this is a dev build |

---

### rust-cross-build

**Build Rust packages for a specific target platform and upload artifacts.**

```yaml
- uses: codervisor/forge/actions/rust-cross-build@v1
  with:
    target: aarch64-apple-darwin
    packages: my-cli
    platform: darwin-arm64
```

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `target` | Yes | — | Rust target triple |
| `packages` | Yes | — | Space-separated Cargo package names |
| `platform` | Yes | — | Platform key for artifact naming |
| `profile` | No | `release` | Cargo build profile |
| `artifact-prefix` | No | `binary` | Artifact name prefix |
| `rust-cache` | No | `true` | Enable Rust build caching |

---

### wait-npm-propagation

**Poll npm registry until packages are visible at a given version.**

```yaml
- uses: codervisor/forge/actions/wait-npm-propagation@v1
  with:
    packages: '["@scope/cli-darwin-arm64", "@scope/cli-linux-x64"]'
    version: '0.2.16'
```

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `packages` | Yes | — | JSON array of package names |
| `version` | Yes | — | Version to wait for |
| `max-retries` | No | `20` | Maximum retry attempts |
| `initial-delay` | No | `5` | Initial delay (seconds) |
| `max-delay` | No | `30` | Maximum delay (seconds) |

---

## Composition Patterns

Skills and actions can be used independently or together:

### Independent Use

- Use `setup-workspace` action alone for any Node.js project
- Use `codervisor-forge` skill for any Rust+Node.js hybrid project
- Use `leanspec-sdd` skill (from [`codervisor/lean-spec`](https://github.com/codervisor/lean-spec)) for any project with specs

### Paired Use

- `codervisor-forge` skill + all actions → Complete CI/CD pipeline
- `codervisor-forge` + `leanspec-sdd` → Full development lifecycle

### Full Stack

Use `codervisor-forge` skill + all four actions for a complete Rust+Node.js hybrid CI/CD setup.
The `publish.config.ts` pattern ties the skill and actions together — a single config file
drives both agent knowledge and CI/CD behavior.

## Installation

### Skills

```bash
# Via LeanSpec CLI
lean-spec skill install codervisor/forge --skill <name>

# Via combo-skills
npx combo-skills install codervisor/forge/skills/<name>

# Manual copy
cp -r skills/<name> .github/skills/

# Git submodule (pinned version)
git submodule add https://github.com/codervisor/forge.git .forge
```

### Actions

Reference directly in workflows — no installation needed:

```yaml
- uses: codervisor/forge/actions/<name>@v1
```
