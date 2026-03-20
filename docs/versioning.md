# Versioning & Release Process

How forge itself is versioned and released.

## Versioning Strategy

Skills are versioned with the repository. Consumers pin via:
- Git ref when using submodules or direct clone
- Reinstalling to get updates when using skill installers
- The `metadata.version` field in SKILL.md frontmatter tracks content version

## Release Process

### 1. Prepare the Release

```bash
# Ensure main is up to date
git checkout main
git pull

# Review changes since last release
git log --oneline v0.1.0..HEAD
```

### 2. Update Version Metadata

Update `metadata.version` in any modified SKILL.md files:

```yaml
metadata:
  version: 0.2.0  # Bump as appropriate
```

### 3. Create the Release Tag

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

### 4. Create GitHub Release

Create a release on GitHub targeting the tag. Include a changelog summarizing what changed.

## What Constitutes a Breaking Change

### Skills (note in SKILL.md)

- Restructuring directories (moving references, templates)
- Changing config format (e.g., PublishConfig type)
- Removing or renaming templates

### Non-breaking Changes

- Adding new reference docs or templates
- Content improvements in SKILL.md
- New examples
- Bug fixes in template scripts or actions

## Changelog

Maintain a changelog in GitHub Releases. Each release should list:

- **Added**: New skills, templates, or references
- **Changed**: Modified behavior or content
- **Fixed**: Bug fixes
- **Breaking**: Any breaking changes

## Pre-release Testing

Before releasing:

1. **CI passes**: The `validate.yml` workflow must pass
2. **Structure check**: All skills have valid structure and token counts
3. **Reference integrity**: All links in SKILL.md files resolve to existing files
