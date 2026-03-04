# Compute Version Action

This template directory references the canonical action at
[`actions/compute-version/`](../../../../actions/compute-version/).

## Usage

```yaml
- uses: codervisor/forge/actions/compute-version@v1
  id: version
  with:
    base-version: '0.2.15'
    is-release: 'false'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `base-version` | Yes | — | Base version from package.json |
| `is-release` | No | `false` | Production release flag |
| `run-id` | No | `${{ github.run_id }}` | Run ID for dev suffix |

## Outputs

| Output | Description |
|--------|-------------|
| `version` | Computed version (e.g., `0.2.16-dev.12345`) |
| `npm-tag` | npm dist-tag (`latest` or `dev`) |
| `is-dev` | Whether this is a dev build |

See the [action source](../../../../actions/compute-version/action.yml) for full details.
