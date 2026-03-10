# AI Agent Instructions

## Project: forge

Reusable agent skills and GitHub Actions for Rust+Node.js hybrid projects.

## Structure

- `skills/` — Agent skills (SKILL.md + references + templates)
- `actions/` — Reusable GitHub Actions composite actions

## Skills

| Skill | Description |
|-------|-------------|
| `codervisor-forge` | Complete toolkit: bootstrap, CI/CD, npm publishing, and versioning for Rust+Node.js hybrid projects |

## Rules

- Each skill is self-contained in its directory with SKILL.md as entry point
- References provide depth; SKILL.md provides overview and decision trees
- Skills are documentation-first — they teach agents, not replace tools
- Keep SKILL.md under 3000 tokens; use references for details
- Templates provide config-driven starting points, not copy-paste code
- Actions follow GitHub Actions composite action conventions
