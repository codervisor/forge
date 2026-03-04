# Forge Catalog

Complete guide to all skills and actions in the forge repository.

## Skills

Skills are agent-teachable knowledge bundles. Install them into your project
so AI agents can use them during development.

### leanspec-sdd

**Spec-Driven Development methodology for AI-assisted development.**

| Attribute | Value |
|-----------|-------|
| Status | Complete |
| Audience | Any LeanSpec project |
| Requirements | LeanSpec CLI or MCP server |
| Directory | [`skills/leanspec-sdd/`](../skills/leanspec-sdd/) |

**Use when:** Working with specs, planning features, multi-step changes, or any task
involving a `specs/` folder or `.lean-spec/config.json`.

**Includes:**
- SKILL.md — Core SDD workflow, tool reference, relationship management
- 5 reference docs — workflow, best practices, examples, commands, workflows
- Validation script — `scripts/validate-spec.sh`

---

### rust-npm-publish

**Distribute Rust binaries via npm platform packages.**

| Attribute | Value |
|-----------|-------|
| Status | References complete, templates in progress |
| Audience | Any Rust+npm project |
| Pairs with | `rust-cross-build` action, `hybrid-ci` skill |
| Directory | [`skills/rust-npm-publish/`](../skills/rust-npm-publish/) |

**Use when:** Publishing Rust CLI tools to npm, setting up cross-platform binary
distribution, or debugging publish pipeline failures.

**Includes:**
- SKILL.md — The optionalDependencies pattern, pipeline overview, config format
- 4 reference docs — publish pipeline, platform matrix, version strategy, troubleshooting
- Type definitions — `templates/types.ts` (PublishConfig interface)
- Script templates — Config-driven starter scripts for the publish pipeline
- 2 examples — Real configs from clawden and lean-spec projects

---

### hybrid-ci

**CI/CD for Rust+Node.js hybrid repos with GitHub Actions.**

| Attribute | Value |
|-----------|-------|
| Status | SKILL.md complete, templates available |
| Audience | Rust+Node monorepos |
| Pairs with | All forge actions |
| Directory | [`skills/hybrid-ci/`](../skills/hybrid-ci/) |

**Use when:** Setting up CI for a project with both `Cargo.toml` and `package.json`,
configuring cross-platform Rust builds, or debugging CI failures.

**Includes:**
- SKILL.md — CI/publish workflow architecture, caching, troubleshooting
- Workflow templates — ci.yml, publish.yml, copilot-setup-steps.yml
- Action templates — READMEs linking to the canonical actions

---

### monorepo-version-sync

**Coordinated versioning across packages and languages.**

| Attribute | Value |
|-----------|-------|
| Status | SKILL.md complete, references and templates available |
| Audience | Any polyglot monorepo |
| Pairs with | `compute-version` action, `rust-npm-publish` skill |
| Directory | [`skills/monorepo-version-sync/`](../skills/monorepo-version-sync/) |

**Use when:** Managing versions across Node and Rust packages, publishing from
pnpm workspaces, or debugging version mismatches.

**Includes:**
- SKILL.md — Single source of truth, sync flow, workspace protocol, dev versioning
- 3 reference docs — version flow, workspace protocol, pre-release strategy
- Script templates — sync-versions, prepare-publish, validate, restore, bump-dev

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
- Use `monorepo-version-sync` skill for any polyglot monorepo
- Use `leanspec-sdd` skill for any project with specs

### Paired Use

- `rust-npm-publish` skill + `rust-cross-build` action → Rust binary npm distribution
- `monorepo-version-sync` skill + `compute-version` action → Version management
- `hybrid-ci` skill + all actions → Complete CI/CD pipeline

### Full Stack

Use all four skills + all four actions for a complete Rust+Node.js hybrid CI/CD setup.
The `publish.config.ts` pattern ties skills and actions together — a single config file
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
