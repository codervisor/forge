# Skill Authoring Guide

How to create, structure, and maintain agent skills in the forge shared skills repository.

Forge is the central skills repo for all Codervisor projects (Ising, Cueless, Synodic, etc.).
Skills added here are available to any consuming project.

## Skill Structure

Every skill follows this directory layout:

```
skills/<name>/
├── SKILL.md          # Entry point — overview, decision trees, when-to-use
├── references/       # Deep-dive docs (best practices, troubleshooting)
├── templates/        # Config-driven starting points
├── examples/         # Real-world configs from consuming projects
└── scripts/          # Utility scripts (validation, generation)
```

### Required Files

| File | Purpose | Constraint |
|------|---------|------------|
| `SKILL.md` | Agent entry point — must be self-contained enough to orient an agent | **Under 3000 tokens** |

### Optional Directories

| Directory | Purpose | When to Include |
|-----------|---------|-----------------|
| `references/` | Deep-dive documentation for complex topics | When SKILL.md can't cover enough depth |
| `templates/` | Config-driven starter files for consuming repos | When the skill involves file generation |
| `examples/` | Real configs from actual projects | When concrete examples aid understanding |
| `scripts/` | Validation or utility scripts | When automated checks are needed |

## SKILL.md Conventions

### Frontmatter

Every SKILL.md starts with YAML frontmatter:

```yaml
---
name: my-skill
description: >
  One-paragraph description. Use when: (1) condition one,
  (2) condition two, (3) condition three.
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---
```

**Required fields:**
- `name` — Kebab-case identifier matching the directory name
- `description` — Multi-sentence description including "Use when:" triggers
- `metadata.author` — Author or organization
- `metadata.version` — Semver version of the skill content

### Content Structure

Follow this section ordering in SKILL.md:

1. **Title** — `# Skill Name` (human-readable)
2. **One-liner** — What agents learn from this skill
3. **When to Use** — Activation triggers (file patterns, user intent)
4. **Core concepts** — Architecture, patterns, key ideas
5. **Decision trees** — Flowcharts for common choices
6. **Troubleshooting** — Common problems and fixes
7. **References** — Links to reference docs (relative paths)
8. **Setup & Activation** — Installation instructions

### Token Budget

SKILL.md must stay **under 3000 tokens**. This is enforced by CI.

Guidelines for staying within budget:
- Use references for detailed explanations — SKILL.md provides orientation
- Prefer tables and bullet points over prose
- Code blocks should be minimal — just enough to show the pattern
- Link to examples instead of embedding them

### When-to-Use Section

This is critical for agent activation. List concrete, detectable triggers:

```markdown
## When to Use This Skill

Activate when any of the following are true:
- The repository has both `Cargo.toml` and `package.json`
- Scripts directory contains `*publish*` or `*platform*` files
- The user asks about [specific topic]
```

## References

### Purpose

References provide depth that SKILL.md can't fit. Each reference is a standalone
document covering one specific topic.

### Naming Convention

Use descriptive kebab-case names:
- `publish-pipeline.md` — not `pipeline.md`
- `workspace-protocol.md` — not `wp.md`
- `troubleshooting.md` — for common failures and fixes

### Linking from SKILL.md

Always use relative paths:

```markdown
## References

- [references/publish-pipeline.md](./references/publish-pipeline.md) — Detailed pipeline steps
- [references/troubleshooting.md](./references/troubleshooting.md) — Common failures and fixes
```

### Content Guidelines

- Each reference is self-contained — it can be read without SKILL.md context
- Include code examples with explanations
- Use tables for configuration references
- Keep each reference focused on one topic

## Templates

### Purpose

Templates are config-driven starting points that consuming repos adapt to their needs.
They are *not* copy-paste code — they demonstrate patterns and mark customization points.

### Design Principles

1. **Config-driven**: Templates read from a project config file (e.g., `publish.config.ts`)
2. **Comment markers**: Use comments to mark customization points: `# CUSTOMIZE: ...`
3. **Minimal dependencies**: Templates should work with standard tools
4. **No duplication**: Share common patterns via references rather than copying them

### Customization Markers

Use clear comments to indicate what consumers should change:

```yaml
# CUSTOMIZE: Replace with your project's binary name
packages: my-cli

# CUSTOMIZE: Add or remove platforms as needed
platforms: ['darwin-x64', 'darwin-arm64', 'linux-x64', 'windows-x64']
```

```typescript
// CUSTOMIZE: Set your npm scope
const scope = '@myorg';
```

## Examples

### Purpose

Examples show real-world usage from actual consuming projects. They demonstrate
how the skill's templates and patterns look in production.

### Guidelines

- Use real project names and configs (with permission)
- Add a comment header explaining the example
- Keep examples complete — they should work as-is in their source project

## Cross-Project Skills

Since forge serves multiple projects, keep these principles in mind:

- **Project-agnostic by default** — skills should work for any project that matches the activation triggers, not just one specific repo
- **Config-driven** — use template customization markers (`# CUSTOMIZE:`) so each consuming project can adapt
- **Document the audience** — if a skill targets a specific stack (e.g., Rust+Node.js), say so in frontmatter and "When to Use"
- **Avoid hardcoded project names** — use config values instead of literal project names in templates

### Naming Convention

Skill names should reflect their domain, not the consuming project:

| Good | Bad |
|------|-----|
| `codervisor-forge` | `ising-ci` |
| `rust-node-publish` | `cueless-setup` |
| `monorepo-versioning` | `synodic-scripts` |

## Checklist

Before submitting a new skill or updating an existing one:

- [ ] SKILL.md is under 3000 tokens
- [ ] SKILL.md has valid YAML frontmatter with all required fields
- [ ] Every file path referenced in SKILL.md exists
- [ ] `references/` contains all promised documents
- [ ] `templates/` contains usable starting points (not empty directories)
- [ ] Skill name is kebab-case and matches directory name
- [ ] "When to Use" section has concrete, detectable triggers
- [ ] Code examples are minimal and correct
- [ ] `docs/catalog.md` is updated with the new skill entry
- [ ] Skill is project-agnostic (uses config-driven templates, not hardcoded values)
