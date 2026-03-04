# forge

Reusable agent skills and GitHub Actions for Rust+Node.js hybrid projects.

## What's Inside

### Skills

Agent-teachable knowledge bundles — each ships as `SKILL.md` + references + templates.

| Skill | Description | Audience |
|-------|-------------|----------|
| [`leanspec-sdd`](skills/leanspec-sdd/) | Spec-Driven Development methodology for AI-assisted development | Any LeanSpec project |
| [`rust-npm-publish`](skills/rust-npm-publish/) | Distribute Rust binaries via npm platform packages | Any Rust+npm project |
| [`hybrid-ci`](skills/hybrid-ci/) | CI/CD for Rust+Node.js hybrid repos with GitHub Actions | Rust+Node monorepos |
| [`monorepo-version-sync`](skills/monorepo-version-sync/) | Coordinated versioning across packages and languages | Any polyglot monorepo |

### Reusable GitHub Actions

Composite actions usable from any GitHub Actions workflow:

```yaml
- uses: codervisor/forge/actions/setup-workspace@main
  with:
    node-version: '22'
```

| Action | Description |
|--------|-------------|
| [`setup-workspace`](actions/setup-workspace/) | Checkout + pnpm + Node.js + cache + install |
| [`compute-version`](actions/compute-version/) | Compute effective version + npm tag (dev vs stable) |
| [`rust-cross-build`](actions/rust-cross-build/) | Build Rust binaries for platform matrix |
| [`wait-npm-propagation`](actions/wait-npm-propagation/) | Poll npm registry with exponential backoff |

## Installation

### Skills

Skills can be installed via:

```bash
# Via LeanSpec CLI
lean-spec skill install codervisor/forge --skill rust-npm-publish

# Via combo-skills
npx combo-skills install codervisor/forge/skills/rust-npm-publish

# Manual: copy skill directory to your project
cp -r skills/rust-npm-publish .github/skills/
```

### GitHub Actions

Reference directly in your workflows:

```yaml
jobs:
  build:
    steps:
      - uses: codervisor/forge/actions/setup-workspace@v1
        with:
          node-version: '22'
          pnpm-version: '10'
```

## Configuration

Skills with templates use a **config-driven approach**. Each consuming repo provides
a `publish.config.ts` (or similar) that declares project-specific values:

```typescript
import type { PublishConfig } from '@codervisor/forge';

export default {
  scope: '@myorg',
  binaries: [
    { name: 'my-cli', scope: 'cli', cargoPackage: 'my-cli' },
  ],
  platforms: ['darwin-x64', 'darwin-arm64', 'linux-x64', 'windows-x64'],
  mainPackages: ['packages/cli'],
  cargoWorkspace: 'Cargo.toml',
} satisfies PublishConfig;
```

## License

MIT
