---
name: bootstrap
description: >
  Bootstrap a new Rust+Node.js hybrid project with all forge skills pre-configured.
  Use when: (1) Starting a new Rust+Node.js project from scratch, (2) Adding forge
  infrastructure to an existing repo, (3) User says "bootstrap", "init", "scaffold",
  or "set up a new project".
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---

# Bootstrap

Teach agents how to scaffold a new Rust+Node.js hybrid project with forge skills,
GitHub Actions workflows, publish pipeline, and versioning infrastructure.

## Required Skills

Bootstrap depends on these forge skills. **Install them after scaffolding** so that
agents working on the new project can use them automatically:

| Skill | Install Command |
|-------|-----------------|
| `leanspec-sdd` | `npx skills add codervisor/forge@leanspec-sdd -g -y` |
| `rust-npm-publish` | `npx skills add codervisor/forge@rust-npm-publish -g -y` |
| `hybrid-ci` | `npx skills add codervisor/forge@hybrid-ci -g -y` |
| `monorepo-version-sync` | `npx skills add codervisor/forge@monorepo-version-sync -g -y` |

## When to Use This Skill

Activate when any of the following are true:
- The user wants to start a new Rust+Node.js project
- The user says "bootstrap", "init", "scaffold", or "set up a new project"
- The user wants to add forge infrastructure to an existing repository
- An empty or near-empty repo needs CI, publishing, and versioning setup

## What Gets Scaffolded

The bootstrap process sets up four integrated systems:

| System | Skill | What It Creates |
|--------|-------|-----------------|
| Spec-Driven Dev | `leanspec-sdd` | `specs/` dir, `.lean-spec/config.json` |
| CI/CD | `hybrid-ci` | `.github/workflows/ci.yml`, `copilot-setup-steps.yml` |
| Publishing | `rust-npm-publish` | `publish.config.ts`, platform scripts |
| Versioning | `monorepo-version-sync` | Version sync scripts, workspace protocol handling |

## Bootstrap Flow

### Step 1: Gather Project Info

Collect these from the user (or infer from existing files):

| Field | Example | Required |
|-------|---------|----------|
| Project name | `my-tool` | Yes |
| npm scope | `@myorg` | Yes |
| Rust binary name(s) | `my-cli` | Yes |
| Cargo package name(s) | `my-cli-rs` | Yes |
| Main npm packages | `packages/cli` | Yes |
| Repository URL | `github.com/myorg/my-tool` | Yes |
| Platforms | `darwin-x64, darwin-arm64, linux-x64, windows-x64` | No (default: all 4) |
| Node version | `22` | No (default: 22) |

### Step 2: Scaffold Structure

Create the project skeleton. See [references/project-structure.md](./references/project-structure.md) for the full tree.

```
my-tool/
├── .github/workflows/       ← CI + publish workflows
├── .lean-spec/config.json   ← LeanSpec configuration
├── specs/                   ← Spec-driven development
├── packages/cli/            ← Main npm package (thin JS wrapper)
│   ├── package.json         ← bin + optionalDependencies
│   └── bin.js               ← Resolves platform binary, spawns it
├── rust/                    ← Rust workspace (or root Cargo.toml)
├── scripts/                 ← Publish & version scripts
├── publish.config.ts        ← Publish pipeline configuration
├── package.json             ← Root package.json (version source of truth)
├── pnpm-workspace.yaml      ← pnpm workspace definition
├── Cargo.toml               ← Rust workspace manifest
└── turbo.json               ← Turborepo config (optional)
```

### Step 3: Generate Files

Use the templates in this skill to generate files. The templates are
config-driven — fill in values from Step 1.

**Order matters:**

1. **Root configs** — `package.json`, `pnpm-workspace.yaml`, `Cargo.toml`, `turbo.json`
2. **Publish config** — `publish.config.ts` (drives script generation)
3. **Main package wrapper** — Copy `bin.js` + `package.json` from `rust-npm-publish/templates/wrapper/`, fill in scope/binary name/platforms
4. **Scripts** — Copy from `rust-npm-publish/templates/scripts/`
5. **Workflows** — Copy from `hybrid-ci/templates/workflows/`, customize matrix
6. **LeanSpec** — Initialize `.lean-spec/config.json` and `specs/`
7. **AGENTS.md** — Project-level agent instructions referencing skills

### Step 4: Customize Workflows

Update the generated workflows with project-specific values:

- **ci.yml** — Adjust build/test/lint commands
- **publish.yml** — Set Cargo package names, npm scope, platform packages list
- **copilot-setup-steps.yml** — Add project-specific tool installation

### Step 5: Install Dependent Skills

Install forge skills so agents can use them in the new project:

```bash
npx skills add codervisor/forge@leanspec-sdd -g -y
npx skills add codervisor/forge@rust-npm-publish -g -y
npx skills add codervisor/forge@hybrid-ci -g -y
npx skills add codervisor/forge@monorepo-version-sync -g -y
```

This ensures that when agents work on the project later, they automatically
have access to skills for spec-driven development, CI/CD, publishing, and
versioning — without needing to discover or install them manually.

### Step 6: Verify

Run these checks after scaffolding:

```bash
pnpm install                          # Dependencies resolve
pnpm build                            # TypeScript compiles
cargo check --workspace               # Rust compiles
pnpm tsx scripts/sync-versions.ts     # Version sync works
```

## Decision Tree

```
Starting from scratch?
  YES → Full scaffold (all steps)
  NO  → Incremental setup ↓

Has package.json?
  NO  → Create root package.json + pnpm-workspace.yaml
  YES → Check for pnpm-workspace.yaml

Has Cargo.toml?
  NO  → Create Cargo workspace
  YES → Verify workspace structure

Has .github/workflows/?
  NO  → Generate from hybrid-ci templates
  YES → Review and update existing workflows

Has scripts/ with publish pipeline?
  NO  → Copy from rust-npm-publish templates
  YES → Verify publish.config.ts exists

Has specs/ or .lean-spec/?
  NO  → Initialize LeanSpec
  YES → Skip LeanSpec setup
```

## Templates

This skill references templates from other skills:

| Template Source | Files |
|----------------|-------|
| [bootstrap/templates/](./templates/) | `package.json`, `pnpm-workspace.yaml`, `Cargo.toml`, `turbo.json`, `AGENTS.md`, `.lean-spec/config.json`, `publish.config.ts` |
| [hybrid-ci/templates/](../hybrid-ci/templates/) | Workflow YAMLs, action READMEs |
| [rust-npm-publish/templates/](../rust-npm-publish/templates/) | Publish scripts, type definitions |
| [monorepo-version-sync/templates/](../monorepo-version-sync/templates/) | Version sync scripts |

## References

- [references/project-structure.md](./references/project-structure.md) — Full project tree with explanations
- [references/checklist.md](./references/checklist.md) — Post-bootstrap verification checklist

## Setup & Activation

Install via forge:
```bash
lean-spec skill install codervisor/forge --skill bootstrap
```

### Auto-activation hints
- Empty or near-empty repository
- User mentions "bootstrap", "init", "scaffold", "new project"
- No `.github/workflows/` and no `scripts/` directory
