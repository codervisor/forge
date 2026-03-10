# Setup Workspace Action

This template directory references the canonical action at
[`actions/setup-workspace/`](../../../../actions/setup-workspace/).

## Usage

```yaml
- uses: codervisor/forge/actions/setup-workspace@v1
  with:
    node-version: '22'
    install-args: '--frozen-lockfile'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `node-version` | No | `22` | Node.js version |
| `pnpm-version` | No | (from packageManager) | pnpm version |
| `install-args` | No | `--frozen-lockfile` | Extra pnpm install args |

See the [action source](../../../../actions/setup-workspace/action.yml) for full details.
