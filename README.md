# forge

Shared agent skills and reusable GitHub Actions for [Codervisor](https://github.com/codervisor) projects.

## Consuming Projects

| Project | Repository | What it uses from forge |
|---------|------------|------------------------|
| **Ising** | [`codervisor/ising`](https://github.com/codervisor/ising) | Skills, Actions |
| **Cueless** | [`codervisor/cueless`](https://github.com/codervisor/cueless) | Skills, Actions |
| **Synodic** | [`codervisor/synodic`](https://github.com/codervisor/synodic) | Skills, Actions |

> Any codervisor project can install skills from this repo. See [Installation](#installation) below.

## What's Inside

### Skills

Agent-teachable knowledge bundles — each ships as `SKILL.md` + references + templates.

| Skill | Description | Audience |
|-------|-------------|----------|
| [`codervisor-forge`](skills/codervisor-forge/) | Bootstrap, CI/CD, npm publishing, and versioning for Rust+Node.js projects | Rust+Node.js hybrid projects |

Skills are designed to be **shared across projects** — install only the ones relevant to your stack.
See [docs/catalog.md](docs/catalog.md) for the full catalog.

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

Skills can be installed into any codervisor project:

```bash
# Via skills CLI (recommended)
npx skills add codervisor/forge@<skill-name> -g -y

# Manual: copy skill directory to your project
cp -r skills/<skill-name> .github/skills/

# Git submodule (pinned version)
git submodule add https://github.com/codervisor/forge.git .forge
```

### GitHub Actions

Reference directly in your workflows — no installation needed:

```yaml
jobs:
  build:
    steps:
      - uses: codervisor/forge/actions/setup-workspace@v1
        with:
          node-version: '22'
          pnpm-version: '10'
```

## Adding a New Skill

Forge is the central place for skills shared across codervisor projects. To add a new skill:

1. Create `skills/<skill-name>/SKILL.md` following the [skill authoring guide](docs/skill-authoring.md)
2. Add references, templates, and examples as needed
3. Update [docs/catalog.md](docs/catalog.md) with the new skill entry
4. Open a PR — skills are reviewed for token budget (< 3000 tokens) and completeness

See [docs/skill-authoring.md](docs/skill-authoring.md) for the full authoring guide.

## Configuration

Skills with templates use a **config-driven approach**. Each consuming repo provides
a config file (e.g., `publish.config.ts`) that declares project-specific values:

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
