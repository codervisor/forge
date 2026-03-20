# forge

Shared agent skills for [Codervisor](https://github.com/codervisor) projects.

## Consuming Projects

| Project | Repository | Skills |
|---------|------------|--------|
| **Ising** | [`codervisor/ising`](https://github.com/codervisor/ising) | `codervisor-forge` |
| **Cueless** | [`codervisor/cueless`](https://github.com/codervisor/cueless) | `codervisor-forge` |
| **Synodic** | [`codervisor/synodic`](https://github.com/codervisor/synodic) | `codervisor-forge` |

## Skills

Agent-teachable knowledge bundles — each ships as `SKILL.md` + references + templates.

| Skill | Description | Audience |
|-------|-------------|----------|
| [`git-commit`](skills/git-commit/) | Conventional commits, atomic staging, hook failure recovery | Any |
| [`rust-node-bootstrap`](skills/rust-node-bootstrap/) | Scaffold a new Rust+Node.js hybrid project with all infrastructure | Rust+Node.js hybrid projects |
| [`rust-npm-publish`](skills/rust-npm-publish/) | Publish Rust binaries to npm via the platform package pattern | Rust+Node.js hybrid projects |
| [`rust-node-ci`](skills/rust-node-ci/) | GitHub Actions CI/CD workflows and composite actions | Rust+Node.js hybrid projects |

See [docs/catalog.md](docs/catalog.md) for the full catalog.

## Installation

```bash
# Via skills CLI (recommended)
npx skills add codervisor/forge@<skill-name> -g -y

# Manual: copy skill directory to your project
cp -r skills/<skill-name> .github/skills/

# Git submodule (pinned version)
git submodule add https://github.com/codervisor/forge.git .forge
```

After installing a skill, copy any templates you need from `skills/<skill-name>/templates/`
into your project. GitHub Actions go into `.github/actions/<name>/`, workflows into `.github/workflows/`.

## Adding a New Skill

1. Create `skills/<skill-name>/SKILL.md` following the [skill authoring guide](docs/skill-authoring.md)
2. Add references, templates, and examples as needed
3. Update [docs/catalog.md](docs/catalog.md) with the new skill entry
4. Open a PR — skills are validated for token budget (< 3000 tokens) and structure

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
