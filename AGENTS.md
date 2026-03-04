# AI Agent Instructions

## Project: forge

Reusable agent skills and GitHub Actions for Rust+Node.js hybrid projects.

## Structure

- `skills/` — Agent skills (SKILL.md + references + templates)
- `actions/` — Reusable GitHub Actions composite actions

## Skills

| Skill | Description |
|-------|-------------|
| `bootstrap` | Scaffold a new Rust+Node.js project with all forge skills |
| `leanspec-sdd` | Spec-Driven Development methodology for AI-assisted development |
| `rust-npm-publish` | Distribute Rust binaries via npm platform packages |
| `hybrid-ci` | CI/CD for Rust+Node.js hybrid repos with GitHub Actions |
| `monorepo-version-sync` | Coordinated versioning across packages and languages |

## Rules

- Each skill is self-contained in its directory with SKILL.md as entry point
- References provide depth; SKILL.md provides overview and decision trees
- Skills are documentation-first — they teach agents, not replace tools
- Keep SKILL.md under 3000 tokens; use references for details
- Templates provide config-driven starting points, not copy-paste code
- Actions follow GitHub Actions composite action conventions
