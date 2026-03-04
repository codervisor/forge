---
status: planned
created: 2026-03-04
priority: high
tags:
- architecture
- skills
- actions
- distribution
created_at: 2026-03-04T06:16:48.332651196Z
updated_at: 2026-03-04T06:21:10.519776685Z
---
# Reusable Skills & Actions Architecture

## Overview

The `forge` repo serves as a centralized library of **reusable agent skills** and **GitHub Actions composite actions** for Rust+Node.js hybrid projects. This spec defines how consumers discover, install, and use these shared assets across multiple repositories — ensuring consistency, maintainability, and easy adoption.

### Problem

Teams building Rust+Node.js hybrid projects face repeated setup costs:
- CI/CD pipelines are copy-pasted and diverge over time
- AI agent knowledge (publish patterns, versioning, cross-compilation) lives in individual repos
- No standard way to share or update operational knowledge across projects

### Goals

1. Define clear contracts for skills and actions so consumers know what to expect
2. Establish distribution mechanisms that support versioning and updates
3. Enable mix-and-match composition — use one skill without requiring all of them
4. Keep the forge repo itself maintainable as the catalog grows

## Design

### Skill Architecture

Each skill is a self-contained knowledge bundle:

```
skills/<name>/
├── SKILL.md          # Entry point — overview, decision trees, when-to-use
├── references/       # Deep-dive docs (best practices, troubleshooting)
├── templates/        # Config-driven starting points (types, scripts, workflows)
└── examples/         # Real-world configs from consuming projects
```

**Key constraints:**
- `SKILL.md` stays under 3000 tokens (context economy for agents)
- References provide depth; SKILL.md provides orientation
- Templates are config-driven, not copy-paste — they adapt to project config
- Skills are documentation-first: they teach agents, not replace tools

### Action Architecture

Each composite action is a single `action.yml`:

```
actions/<name>/
└── action.yml        # Self-contained composite action
```

**Key constraints:**
- Actions are stateless and composable
- Inputs have sensible defaults; only project-specific values are required
- Actions handle caching, retries, and error reporting internally
- Versioned via git tags (e.g., `codervisor/forge/actions/setup-workspace@v1`)

### Distribution Model

#### Skills Distribution

| Method | Command | Use Case |
|--------|---------|----------|
| LeanSpec CLI | `lean-spec skill install codervisor/forge --skill <name>` | LeanSpec projects |
| combo-skills | `npx combo-skills install codervisor/forge/skills/<name>` | Any project |
| Manual copy | `cp -r skills/<name> .github/skills/` | Quick setup |
| Git submodule | `git submodule add` | Pinned version |

Skills are installed into the consuming repo (typically `.github/skills/` or `.copilot/skills/`) so agents can read them at development time.

#### Actions Distribution

Actions are referenced directly via GitHub Actions' built-in mechanism:

```yaml
- uses: codervisor/forge/actions/<name>@<ref>
```

No installation step needed — GitHub resolves them at workflow runtime.

### Composition Model

Skills and actions are designed to work independently or together:

- **Independent**: Use `setup-workspace` action alone for any Node.js project
- **Paired**: Use `rust-npm-publish` skill + `rust-cross-build` action for Rust→npm publishing
- **Full stack**: Use all four skills + all four actions for a complete Rust+Node.js hybrid CI/CD

The `publish.config.ts` pattern ties skills and actions together — a single config file drives both agent knowledge and CI/CD behavior.

### Versioning Strategy

- **Actions**: Semver git tags (`@v1`, `@v1.2.0`) following GitHub Actions conventions
- **Skills**: Versioned with the repo; consumers pin via git ref or reinstall to update
- **Breaking changes**: Major version bump on actions; skill SKILL.md documents migration

## Plan

- [ ] Document skill authoring guidelines (structure, token limits, reference patterns)
- [ ] Document action authoring guidelines (input conventions, error handling, caching)
- [ ] Define a skill manifest format for discovery and metadata
- [ ] Add a CI workflow that validates all skills (token counts, structure) and actions (syntax)
- [ ] Create a `docs/` site or expanded README with a catalog and usage guides
- [ ] Add integration tests that verify actions work with sample projects
- [ ] Establish a versioning and release process for the repo

## Test

- [ ] A new consumer can install a skill and have their agent use it within 5 minutes
- [ ] A new consumer can reference any action in a workflow without additional setup
- [ ] Skills can be used independently — no implicit dependencies between skills
- [ ] Actions pass GitHub Actions `actionlint` validation
- [ ] All SKILL.md files stay under 3000 tokens
- [ ] Templates adapt correctly to different project configurations

## Notes

### Current Inventory

**Skills (4):**
- `leanspec-sdd` — Spec-Driven Development methodology
- `rust-npm-publish` — Rust binary distribution via npm
- `hybrid-ci` — CI/CD for Rust+Node.js repos
- `monorepo-version-sync` — Cross-language version coordination

**Actions (4):**
- `setup-workspace` — Checkout + pnpm + Node.js + cache
- `compute-version` — Dev vs. stable version calculation
- `rust-cross-build` — Cross-platform Rust binary builds
- `wait-npm-propagation` — npm registry polling with backoff

### Open Questions

- Should skills support a `dependencies` field to declare inter-skill relationships?
- Should we add a `forge.json` manifest at the repo root for programmatic discovery?
- How do we handle skill updates for consumers who manually copied files?
- Should actions be published to the GitHub Marketplace for discoverability?
