# Wait npm Propagation Action

This template directory references the canonical action at
[`actions/wait-npm-propagation/`](../../../../actions/wait-npm-propagation/).

## Usage

```yaml
- uses: codervisor/forge/actions/wait-npm-propagation@v1
  with:
    packages: '["@scope/cli-darwin-arm64", "@scope/cli-linux-x64"]'
    version: '0.2.16'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `packages` | Yes | — | JSON array of package names |
| `version` | Yes | — | Version to wait for |
| `max-retries` | No | `20` | Maximum retry attempts |
| `initial-delay` | No | `5` | Initial delay (seconds) |
| `max-delay` | No | `30` | Maximum delay (seconds) |

See the [action source](../../../../actions/wait-npm-propagation/action.yml) for full details.
