# AI Agent Instructions

## Project: forge

Shared agent skills for Codervisor projects (Ising, Cueless, Synodic, and others).

## Structure

- `skills/` — Agent skills (SKILL.md + references + templates), shared across projects
- `docs/` — Authoring guides, catalog, and versioning docs

## Skills

| Skill | Description | Consuming Projects |
|-------|-------------|-------------------|
| `git-commit` | Conventional commits, atomic staging, hook failure recovery | Any |
| `rust-node-bootstrap` | Scaffold a new Rust+Node.js hybrid project | Ising, Cueless, Synodic |
| `rust-npm-publish` | Publish Rust binaries to npm via the optionalDependencies platform package pattern | Ising, Cueless, Synodic |
| `rust-node-ci` | GitHub Actions CI/CD workflows and installable composite actions | Ising, Cueless, Synodic |
| `parallel-worktrees` | Parallel AI agent sessions in git worktrees with GitHub PR sync | Any |
| `github-integration` | Enable `gh` CLI in Claude Code cloud and other cloud AI coding environments | Any |

## Consuming Projects

This repo serves as the central skills repository for all Codervisor projects:

- **Ising** — [`codervisor/ising`](https://github.com/codervisor/ising)
- **Cueless** — [`codervisor/cueless`](https://github.com/codervisor/cueless)
- **Synodic** — [`codervisor/synodic`](https://github.com/codervisor/synodic)

Skills are installed into consuming projects via `npx skills add codervisor/forge@<skill-name> -g -y` or by copying the skill directory.

Templates (workflows, composite actions, scripts) inside each skill are installed locally into the consuming project — they are not referenced from this repo at runtime.

## Rules

- Each skill is self-contained in its directory with SKILL.md as entry point
- References provide depth; SKILL.md provides overview and decision trees
- Skills are documentation-first — they teach agents, not replace tools
- Keep SKILL.md under 3000 tokens; use references for details
- Templates provide config-driven starting points, not copy-paste code
- Skills should be project-agnostic where possible — use config-driven templates so consuming projects can adapt them
- When adding a new skill, update `docs/catalog.md` and this file
