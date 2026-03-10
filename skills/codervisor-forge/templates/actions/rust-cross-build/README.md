# Rust Cross Build Action

This template directory references the canonical action at
[`actions/rust-cross-build/`](../../../../actions/rust-cross-build/).

## Usage

```yaml
- uses: codervisor/forge/actions/rust-cross-build@v1
  with:
    target: aarch64-apple-darwin
    packages: my-cli
    platform: darwin-arm64
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `target` | Yes | — | Rust target triple |
| `packages` | Yes | — | Space-separated Cargo package names |
| `platform` | Yes | — | Platform key for artifact naming |
| `profile` | No | `release` | Cargo build profile |
| `artifact-prefix` | No | `binary` | Artifact name prefix |
| `rust-cache` | No | `true` | Enable Rust build caching |

See the [action source](../../../../actions/rust-cross-build/action.yml) for full details.
