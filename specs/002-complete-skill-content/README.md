---
status: planned
created: 2026-03-04
priority: high
tags:
- skills
- content
- templates
- references
parent: '001'
created_at: 2026-03-04T06:20:19.967253099Z
updated_at: 2026-03-04T06:21:07.459711898Z
---
# Complete Missing Skill References, Templates, and Scripts

## Overview

An audit of all four skills reveals that while every SKILL.md is well-written, most skills are missing the supporting content they reference — empty template directories, promised reference docs that don't exist, and no script templates. An agent following a SKILL.md will hit dead ends when it tries to load the referenced files.

### Severity by skill

| Skill | SKILL.md | References | Templates | Verdict |
|-------|----------|-----------|-----------|---------|
| **hybrid-ci** | Complete | Empty | Empty scaffolds | Critical |
| **monorepo-version-sync** | Strong | 3 promised, 0 exist | Empty | Critical |
| **rust-npm-publish** | Comprehensive | 4 files, good | `scripts/` empty (10+ needed) | Moderate |
| **leanspec-sdd** | Excellent | 5 files, complete | N/A (methodology skill) | Complete |

## Design

### Approach per skill

**hybrid-ci** — Create workflow templates (ci.yml, publish.yml, copilot-setup-steps.yml) in `templates/workflows/`. Link action templates to the existing `actions/` directory rather than duplicating. Optionally add a reference doc for workflow composition patterns.

**monorepo-version-sync** — Write the three missing reference docs: `version-flow.md`, `workspace-protocol.md`, `pre-release-strategy.md`. Create script templates for the core operations (sync-versions, prepare-publish, validate-no-workspace-protocol, restore-packages, bump-dev-version).

**rust-npm-publish** — Populate `templates/scripts/` with config-driven template scripts for the 10+ pipeline steps documented in `references/publish-pipeline.md`. These should be starter implementations, not production-ready — consumers adapt them.

**leanspec-sdd** — No critical work. Optionally add spec templates (feature, umbrella) but this skill is already complete.

### Principles

- Templates are config-driven starting points, not copy-paste code
- Keep content aligned with what SKILL.md already promises
- Don't duplicate — reference existing `actions/` YAML rather than copy it into templates

## Plan

- [ ] **hybrid-ci**: Create `templates/workflows/ci.yml` template
- [ ] **hybrid-ci**: Create `templates/workflows/publish.yml` template
- [ ] **hybrid-ci**: Create `templates/workflows/copilot-setup-steps.yml` template
- [ ] **hybrid-ci**: Add README or symlinks in `templates/actions/` pointing to `actions/`
- [ ] **monorepo-version-sync**: Write `references/version-flow.md`
- [ ] **monorepo-version-sync**: Write `references/workspace-protocol.md`
- [ ] **monorepo-version-sync**: Write `references/pre-release-strategy.md`
- [ ] **monorepo-version-sync**: Create script templates (sync-versions, prepare-publish, validate, restore, bump-dev)
- [ ] **rust-npm-publish**: Create script templates in `templates/scripts/` for all pipeline steps
- [ ] Validate all skills pass structure checks (no broken references)

## Test

- [ ] Every file path referenced in a SKILL.md actually exists
- [ ] All `references/` directories contain the docs their SKILL.md links to
- [ ] All `templates/` directories contain usable starting points (not empty)
- [ ] `leanspec-sdd` remains untouched (already complete)
- [ ] All SKILL.md files still under 3000 tokens after changes

## Notes

### What this spec does NOT cover
- Adding new skills beyond the current four
- Changing any SKILL.md content (those are already well-written)
- Action YAML improvements (covered by spec 001's action authoring guidelines task)
- Skill manifest format or discovery tooling (also spec 001 scope)

### Open question
- Should `hybrid-ci` templates be fully parameterized (mustache/handlebars style) or plain YAML with comments marking customization points? Plain YAML with comment markers is simpler and matches how other skills work.