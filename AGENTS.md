# AI Agent Instructions

## Project: forge

Shared agent skills and reusable GitHub Actions for Codervisor projects (Ising, Cueless, Synodic, and others).

## Structure

- `skills/` — Agent skills (SKILL.md + references + templates), shared across projects
- `actions/` — Reusable GitHub Actions composite actions
- `docs/` — Authoring guides, catalog, and versioning docs

## Skills

| Skill | Description | Consuming Projects |
|-------|-------------|-------------------|
| `codervisor-forge` | Bootstrap, CI/CD, npm publishing, and versioning for Rust+Node.js hybrid projects | Ising, Cueless, Synodic |

## Consuming Projects

This repo serves as the central skills repository for all Codervisor projects:

- **Ising** — [`codervisor/ising`](https://github.com/codervisor/ising)
- **Cueless** — [`codervisor/cueless`](https://github.com/codervisor/cueless)
- **Synodic** — [`codervisor/synodic`](https://github.com/codervisor/synodic)

Skills are installed into consuming projects via `npx skills add codervisor/forge@<skill-name> -g -y` or by copying the skill directory.

## Rules

- Each skill is self-contained in its directory with SKILL.md as entry point
- References provide depth; SKILL.md provides overview and decision trees
- Skills are documentation-first — they teach agents, not replace tools
- Keep SKILL.md under 3000 tokens; use references for details
- Templates provide config-driven starting points, not copy-paste code
- Actions follow GitHub Actions composite action conventions
- Skills should be project-agnostic where possible — use config-driven templates so consuming projects can adapt them
- When adding a new skill, update `docs/catalog.md` and this file
