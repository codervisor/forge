# Action Authoring Guide

How to create and maintain reusable GitHub Actions composite actions in forge.

## Action Structure

Each action is a single directory with one `action.yml`:

```
actions/<name>/
└── action.yml
```

Actions are self-contained composite actions — no external scripts or dependencies
beyond what's available in the GitHub Actions runner.

## action.yml Conventions

### Metadata

```yaml
name: 'Human-Readable Name'
description: 'One-line description of what the action does'
```

- `name` — Title case, concise (e.g., "Setup Workspace", "Rust Cross Build")
- `description` — Single sentence describing the action's purpose

### Inputs

```yaml
inputs:
  required-input:
    description: 'What this input controls'
    required: true
  optional-with-default:
    description: 'What this input controls'
    required: false
    default: 'sensible-value'
```

**Input design principles:**

1. **Sensible defaults**: Only project-specific values should be required
2. **Descriptive names**: Use kebab-case, be specific (e.g., `node-version` not `version`)
3. **Clear descriptions**: One line explaining what the input controls
4. **Minimal required inputs**: Prefer defaults that work for 80% of cases

### Outputs

```yaml
outputs:
  version:
    description: 'Computed effective version'
    value: ${{ steps.compute.outputs.version }}
```

- Always describe what the output contains
- Reference step outputs using `${{ steps.<id>.outputs.<name> }}`

### Steps

```yaml
runs:
  using: 'composite'
  steps:
    - id: step-name
      shell: bash
      run: |
        # Script content
```

- Always use `using: 'composite'` — these are composite actions
- Always specify `shell: bash` for run steps
- Use `id:` on steps that produce outputs
- Group related commands in a single step

## Design Principles

### 1. Stateless & Composable

Actions should not assume anything about prior or subsequent steps.
Each action is a self-contained unit that can be used independently.

### 2. Error Handling

- Use `set -euo pipefail` for bash scripts with complex logic
- Provide clear error messages with context
- Fail fast — don't continue after errors

```yaml
- shell: bash
  run: |
    set -euo pipefail
    if [ -z "${{ inputs.target }}" ]; then
      echo "❌ Error: target input is required"
      exit 1
    fi
```

### 3. Caching

Actions that install tools or dependencies should handle caching internally:

```yaml
# Node.js + pnpm caching
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'

# Rust caching
- uses: Swatinem/rust-cache@v2
  with:
    shared-key: ${{ inputs.platform }}
```

### 4. Logging

Use emoji prefixes for visual scanning in CI logs:

| Emoji | Meaning |
|-------|---------|
| 📦 | Package/artifact operation |
| 🔨 | Build step |
| ⏳ | Waiting/polling |
| ✅ | Success |
| ❌ | Failure |
| 🔧 | Configuration |

### 5. Idempotency

Actions should be safe to re-run. Avoid side effects that break on repeated execution.

## Input Validation

Validate required inputs at the start of the action:

```yaml
- name: Validate inputs
  shell: bash
  run: |
    if [ -z "${{ inputs.packages }}" ]; then
      echo "❌ 'packages' input is required"
      exit 1
    fi
```

## Versioning

Actions are versioned via git tags following GitHub Actions conventions:

```
codervisor/forge/actions/setup-workspace@v1      # Major version (recommended)
codervisor/forge/actions/setup-workspace@v1.2.0   # Exact version
codervisor/forge/actions/setup-workspace@main      # Branch (dev/testing)
```

### Tag Strategy

- **`@v1`** — Floating major tag, updated on each minor/patch release
- **`@v1.2.0`** — Exact version tag, never moved
- **`@main`** — Latest development (not for production)

### Breaking Changes

A breaking change requires a major version bump:
- Removing or renaming inputs
- Changing default behavior
- Changing output format

Non-breaking changes (minor/patch):
- Adding new optional inputs with defaults
- Bug fixes
- Performance improvements
- Adding new outputs

## Testing

### Local Testing

Use [act](https://github.com/nektos/act) to test actions locally:

```bash
act -j test -W .github/workflows/test-actions.yml
```

### CI Testing

The validation workflow (`validate.yml`) checks:
- `action.yml` syntax is valid YAML
- All required fields are present
- Inputs have descriptions

## Checklist

Before submitting a new action or updating an existing one:

- [ ] `action.yml` has `name` and `description` fields
- [ ] All inputs have `description` fields
- [ ] Required inputs are marked `required: true`
- [ ] Optional inputs have sensible `default` values
- [ ] All `run` steps specify `shell: bash`
- [ ] Action uses `using: 'composite'`
- [ ] Error handling is present for critical operations
- [ ] Caching is handled for tool installations
- [ ] Action is idempotent (safe to re-run)
