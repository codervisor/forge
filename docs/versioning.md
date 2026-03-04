# Versioning & Release Process

How forge itself is versioned and released.

## Versioning Strategy

### Actions

Actions follow GitHub Actions versioning conventions using git tags:

| Tag Format | Example | Purpose |
|------------|---------|---------|
| `v{major}` | `v1` | Floating major tag — consumers use this |
| `v{major}.{minor}.{patch}` | `v1.2.0` | Exact version tag — immutable |

**Consumers reference the major tag:**

```yaml
- uses: codervisor/forge/actions/setup-workspace@v1
```

**The floating major tag is updated on each release** to point to the latest
`v1.x.x` tag. This gives consumers automatic patch/minor updates.

### Skills

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
git log --oneline v1.2.0..HEAD
```

### 2. Update Version Metadata

Update `metadata.version` in any modified SKILL.md files:

```yaml
metadata:
  version: 0.2.0  # Bump as appropriate
```

### 3. Create the Release Tag

```bash
# Create exact version tag
git tag -a v1.3.0 -m "Release v1.3.0"

# Update floating major tag
git tag -fa v1 -m "Update v1 to v1.3.0"

# Push tags
git push origin v1.3.0
git push origin v1 --force
```

### 4. Create GitHub Release

Create a release on GitHub targeting the exact version tag (`v1.3.0`).
Include a changelog summarizing what changed.

## What Constitutes a Breaking Change

### Actions (requires major version bump)

- Removing or renaming an input
- Changing the behavior of an existing input
- Removing or renaming an output
- Changing the default value of an input in a way that breaks existing workflows

### Skills (note in SKILL.md)

- Restructuring directories (moving references, templates)
- Changing config format (e.g., PublishConfig type)
- Removing or renaming templates

### Non-breaking Changes (minor or patch)

- Adding new optional inputs with defaults
- Adding new outputs
- Adding new reference docs or templates
- Bug fixes in action logic
- Content improvements in SKILL.md
- New examples

## Changelog

Maintain a changelog in GitHub Releases. Each release should list:

- **Added**: New skills, actions, templates, or references
- **Changed**: Modified behavior or content
- **Fixed**: Bug fixes
- **Breaking**: Any breaking changes (major version only)

## Pre-release Testing

Before releasing:

1. **CI passes**: The `validate.yml` workflow must pass
2. **Structure check**: All skills have valid structure and token counts
3. **Action syntax**: All `action.yml` files are valid YAML
4. **Reference integrity**: All links in SKILL.md files resolve to existing files
