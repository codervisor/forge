# Forge Catalog

Complete guide to all skills in the forge shared skills repository.

## Consuming Projects

| Project | Repository | Skills Used |
|---------|------------|-------------|
| Ising | [`codervisor/ising`](https://github.com/codervisor/ising) | `rust-node-bootstrap`, `rust-npm-publish`, `rust-node-ci` |
| Cueless | [`codervisor/cueless`](https://github.com/codervisor/cueless) | `rust-node-bootstrap`, `rust-npm-publish`, `rust-node-ci` |
| Synodic | [`codervisor/synodic`](https://github.com/codervisor/synodic) | `rust-node-bootstrap`, `rust-npm-publish`, `rust-node-ci` |

## Skills

Skills are agent-teachable knowledge bundles. Install only what's relevant — each skill is independent.

---

### git-commit

**Conventional commits, atomic staging, and hook failure recovery.**

| Attribute | Value |
|-----------|-------|
| Audience | Any project using git |
| Directory | [`skills/git-commit/`](../skills/git-commit/) |

**Use when:** Staging and committing changes, writing commit messages, deciding what to group in a single commit, handling pre-commit hook failures, or choosing between amend and new commit.

**Covers:** Conventional commits format, atomic commit rule, staging checklist (no secrets/debug code), pre-commit hook failure recovery, amend vs new commit decision.

---

### rust-node-bootstrap

**Scaffold a new Rust+Node.js hybrid project from zero.**

| Attribute | Value |
|-----------|-------|
| Audience | Rust+Node.js hybrid projects |
| Directory | [`skills/rust-node-bootstrap/`](../skills/rust-node-bootstrap/) |

**Use when:** Starting a new Rust+Node.js project, adding missing infrastructure to an existing repo.

**Covers:** Project structure, file generation order, gather project info, post-bootstrap verification checklist.

**Includes:**
- References: `project-structure.md`, `checklist.md`
- Templates: `templates/bootstrap/` — root configs (`package.json`, `Cargo.toml`, `pnpm-workspace.yaml`, `turbo.json`, `publish.config.ts`)

---

### rust-npm-publish

**Publish Rust binaries to npm using the `optionalDependencies` platform package pattern.**

| Attribute | Value |
|-----------|-------|
| Audience | Rust+Node.js hybrid projects |
| Directory | [`skills/rust-npm-publish/`](../skills/rust-npm-publish/) |

**Use when:** Publishing Rust binaries to npm, setting up platform packages, managing version sync across pnpm + Cargo workspaces, debugging publish pipeline failures.

**Covers:** Platform package architecture (main + per-OS packages), `bin.js` wrapper, `publish.config.ts`, full publish pipeline (11 steps), version sync, `workspace:*` protocol, dev versioning.

**Includes:**
- References: `publish-pipeline.md`, `platform-matrix.md`, `version-strategy.md`, `workspace-protocol.md`, `troubleshooting.md`
- Templates: `templates/scripts/` (11 publish pipeline scripts), `templates/wrapper/` (`bin.js` + package.json), `templates/types.ts`
- Examples: real `publish.config.ts` from consuming projects

---

### rust-node-ci

**GitHub Actions CI/CD for Rust+Node.js hybrid repos.**

| Attribute | Value |
|-----------|-------|
| Audience | Rust+Node.js hybrid projects |
| Directory | [`skills/rust-node-ci/`](../skills/rust-node-ci/) |

**Use when:** Setting up or fixing GitHub Actions workflows, adding composite actions, working with the cross-platform build matrix, debugging CI failures.

**Covers:** `ci.yml` + `publish.yml` structure, installable composite actions, publish workflow matrix, artifact flow, caching strategy, dev versioning in CI.

**Installable composite actions** (copy to `.github/actions/<name>/`):

| Action | Purpose |
|--------|---------|
| `setup-workspace` | Checkout + pnpm + Node.js + cache + install |
| `rust-cross-build` | Build Rust binaries for a target platform |
| `compute-version` | Compute dev/release version + npm tag |
| `wait-npm-propagation` | Poll npm until platform packages are visible |

**Includes:**
- References: `troubleshooting.md` (CI/CD issues)
- Templates: `templates/` (`ci.yml`, `publish.yml`, `copilot-setup-steps.yml`), `templates/actions/` (4 composite actions)

---

### parallel-worktrees

**Run multiple AI coding agent sessions in parallel using git worktrees, with GitHub PR integration.**

| Attribute | Value |
|-----------|-------|
| Status | Complete |
| Audience | Any project using git + GitHub |
| Requirements | `git`, `gh` CLI |
| Directory | [`skills/parallel-worktrees/`](../skills/parallel-worktrees/) |

**Use when:** Running multiple AI agents simultaneously on different features or bugs,
setting up isolated agent workspaces in the same repo, pushing parallel branches to
GitHub and opening/updating PRs, coordinating between concurrent sessions, or cleaning
up after merging.

**Covers:**
- Worktree creation, layout convention, and the one-agent-one-worktree-one-branch rule
- Full lifecycle: create → brief agent → work → push → PR → sync → merge → clean up
- Branch naming conventions for agent-owned branches
- Common pitfalls and fixes (detached HEAD, index locks, stale entries)
- GitHub PR management via `gh` CLI (draft PRs, linking related PRs, merge strategies)
- Agent coordination patterns (dependency ordering, handoffs, avoiding file conflicts)

**References:**

| File | Purpose |
|------|---------|
| `references/worktree-lifecycle.md` | Full command reference, flags, edge cases |
| `references/github-pr-sync.md` | PR creation, updates, linking, merge strategies |
| `references/agent-coordination.md` | Coordination patterns for parallel sessions |

---

### github-integration

**Enable `gh` CLI in Claude Code cloud and other cloud-based AI coding environments.**

| Attribute | Value |
|-----------|-------|
| Status | Complete |
| Audience | Any project using GitHub |
| Requirements | `gh` CLI (pre-installed in cloud sessions) |
| Directory | [`skills/github-integration/`](../skills/github-integration/) |

**Use when:** Setting up a repo so Claude Code cloud can create PRs and issues,
adding `copilot-setup-steps.yml`, troubleshooting `gh` auth failures in cloud
sessions, or configuring `GITHUB_TOKEN` for headless environments.

**Covers:**
- `copilot-setup-steps.yml` setup and customization
- `gh` authentication via `GITHUB_TOKEN` / `GH_TOKEN`
- Token scopes and permissions
- Troubleshooting auth failures, 401/403 errors, and rate limiting
- Common `gh` commands for AI agents (PRs, issues, API)

**References:**

| File | Purpose |
|------|---------|
| `references/cloud-auth.md` | Token auth, scopes, and troubleshooting |
| `references/copilot-setup-steps.md` | Full guide to customizing the setup workflow |

**Templates:**

| File | Purpose |
|------|---------|
| `templates/copilot-setup-steps.yml` | Ready-to-install setup workflow with multi-stack support |

---

## Installation

```bash
# Install a specific skill
npx skills add codervisor/forge@<skill-name> -g -y

# Manual: copy skill directory
cp -r skills/<skill-name> .github/skills/

# Git submodule (pinned version)
git submodule add https://github.com/codervisor/forge.git .forge
```

After installing, copy any templates you need from `skills/<skill-name>/templates/` into your project.
Composite actions go into `.github/actions/<name>/`, workflows into `.github/workflows/`.
