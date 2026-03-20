---
name: github-integration
description: >
  Enable the GitHub CLI (`gh`) in Claude Code cloud sessions and other
  cloud-based AI coding environments. Use this skill when: (1) setting up a
  repo so Claude Code cloud can create PRs, issues, and releases, (2) adding
  `copilot-setup-steps.yml` to a project, (3) troubleshooting `gh` auth
  failures in cloud sessions, or (4) configuring `GITHUB_TOKEN` for headless
  CI-like environments. Triggers on: "enable gh", "github integration",
  "Claude Code cloud setup", "copilot setup steps", "gh auth in cloud",
  "gh not working in cloud", or any request involving GitHub CLI access from
  cloud-based AI coding agents.
metadata:
  author: Codervisor
  version: 0.1.0
  homepage: https://github.com/codervisor/forge
---

# GitHub Integration

Enable `gh` CLI access in Claude Code cloud and other cloud-based AI coding
environments so agents can create PRs, manage issues, and interact with GitHub
APIs.

## When to Use This Skill

Activate when:
- User wants Claude Code cloud to use `gh` (PRs, issues, releases, API calls)
- User needs to add `copilot-setup-steps.yml` to their project
- `gh` commands fail with auth errors in a cloud session
- User wants to enable GitHub integration for any cloud-based AI coding agent

## Decision Tree

```
What does the user need?

Enable gh in Claude Code cloud?
  → Add copilot-setup-steps.yml to the repo (Template §1)
  → The workflow authenticates gh using the session's GITHUB_TOKEN
  → Commit and push — cloud sessions pick it up automatically

gh commands failing in cloud?
  → Check: does .github/copilot-setup-steps.yml exist?
    → No  → Add it (Template §1)
    → Yes → Check the auth step runs before gh usage
  → Check: is GITHUB_TOKEN available? (echo $GITHUB_TOKEN)
  → Check: gh auth status — does it show "Logged in"?
  → See references/troubleshooting.md for more

Customize what the cloud session installs?
  → Edit copilot-setup-steps.yml to add build steps, tools, etc.
  → Keep the gh auth step first — other steps depend on it

Need gh in local dev too?
  → Run: gh auth login (interactive, browser-based)
  → Or set GITHUB_TOKEN env var for headless/CI use
```

## How It Works

Claude Code cloud (and GitHub Copilot coding agents) run in ephemeral
containers. The environment provides a `GITHUB_TOKEN` with repo-scoped
permissions, but `gh` needs to be told to use it.

The `.github/copilot-setup-steps.yml` workflow runs automatically when a
cloud session starts. It:

1. Checks out the repo
2. Authenticates `gh` using the session token
3. Installs project dependencies (customizable)
4. Makes tools available to the agent

## Quick Start

Add this file to your repo at `.github/copilot-setup-steps.yml`:

```yaml
name: "Copilot Setup Steps"

on: repository_dispatch

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Authenticate gh CLI
        run: gh auth status
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

That's the minimal version. See `templates/copilot-setup-steps.yml` for a
full template with dependency installation and build steps.

## Token Permissions

The `GITHUB_TOKEN` provided in cloud sessions typically has:

| Permission | Access |
|-----------|--------|
| `contents` | read/write (push commits) |
| `pull-requests` | read/write (create/update PRs) |
| `issues` | read/write |
| `metadata` | read |

If you need broader permissions (e.g., `packages`, `actions`), configure them
in the workflow's `permissions:` block.

## Common gh Commands for Agents

```bash
# PRs
gh pr create --title "..." --body "..."
gh pr list
gh pr view
gh pr merge --squash --delete-branch

# Issues
gh issue list
gh issue view <number>
gh issue create --title "..." --body "..."

# API (for anything not covered by subcommands)
gh api repos/{owner}/{repo}/actions/runs
```

## Pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| `gh: command not found` | gh not installed in container | Add install step to copilot-setup-steps.yml |
| `HTTP 401` / auth error | Token not configured | Ensure `GH_TOKEN` env var is set in the workflow |
| `HTTP 403` on push | Token lacks `contents: write` | Add `permissions: contents: write` to workflow |
| `gh pr create` fails | No upstream branch | Push with `git push -u origin <branch>` first |
| Stale token | Session token expired | Restart the cloud session |

## References

- `references/cloud-auth.md` — Deep dive on token auth, scopes, and troubleshooting
- `references/copilot-setup-steps.md` — Full guide to customizing the setup workflow

## Setup & Activation

```bash
npx skills add codervisor/forge@github-integration -g -y
```

Auto-activates when: user mentions "gh in cloud", "github integration",
"copilot setup steps", or `gh` auth failures in cloud environments.
