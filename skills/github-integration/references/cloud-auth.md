# Cloud Authentication Reference

How `gh` CLI authentication works in Claude Code cloud and other
cloud-based AI coding environments.

## Table of Contents
1. [How tokens work](#how-tokens-work)
2. [Token scopes](#token-scopes)
3. [Configuring gh to use the token](#configuring-gh-to-use-the-token)
4. [Custom permissions](#custom-permissions)
5. [Troubleshooting](#troubleshooting)

---

## How Tokens Work

Cloud coding sessions (Claude Code cloud, GitHub Copilot agents) run in
ephemeral containers provisioned by GitHub. Each session receives a
`GITHUB_TOKEN` scoped to the repository that triggered the session.

This token is:
- **Short-lived** — expires when the session ends
- **Repo-scoped** — can only access the triggering repository (by default)
- **Automatically rotated** — cannot be reused across sessions

The token is injected as `secrets.GITHUB_TOKEN` in the setup workflow and
is available as an environment variable inside the container.

---

## Token Scopes

Default permissions for the session token:

| Permission | Level | Enables |
|-----------|-------|---------|
| `contents` | write | Push commits, create/delete branches |
| `pull-requests` | write | Create, update, merge PRs |
| `issues` | write | Create, comment on, close issues |
| `metadata` | read | Repo metadata, topics, visibility |
| `statuses` | write | Set commit statuses |

Permissions **not** included by default:
- `packages` — cannot publish to GitHub Packages
- `actions` — cannot trigger or manage workflows
- `admin` — no repo settings access
- `pages` — no GitHub Pages access

---

## Configuring gh to Use the Token

### Option 1: GH_TOKEN environment variable (recommended)

```yaml
- name: Authenticate gh CLI
  run: gh auth status
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`gh` automatically detects `GH_TOKEN` — no login step needed.

### Option 2: gh auth login with token

```yaml
- name: Authenticate gh CLI
  run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
```

Use this if you need `gh` to write a persistent auth config (rare in
ephemeral containers).

### Option 3: GITHUB_TOKEN env var

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`gh` also detects `GITHUB_TOKEN`, but `GH_TOKEN` takes precedence.
Prefer `GH_TOKEN` to avoid conflicts with other tools that read
`GITHUB_TOKEN`.

---

## Custom Permissions

If the default token scopes are insufficient, declare explicit permissions
in the setup workflow:

```yaml
jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      packages: write        # added
      actions: read           # added
    steps:
      # ...
```

**Note:** You can only *narrow* permissions, not broaden them beyond what
the session token allows. Organization policies may further restrict
available scopes.

---

## Troubleshooting

### gh auth status shows "not logged in"

**Cause:** `GH_TOKEN` not set in the environment.

**Fix:** Ensure the setup step passes the token:
```yaml
env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### HTTP 401 Unauthorized

**Cause:** Token expired or was never set.

**Fix:**
1. Check `gh auth status`
2. Verify `GH_TOKEN` is in the environment: `echo $GH_TOKEN | head -c 10`
3. If expired, restart the cloud session

### HTTP 403 Forbidden

**Cause:** Token lacks required permission.

**Fix:**
1. Check which permission is needed from the error message
2. Add it to the `permissions:` block in the workflow
3. Check org-level token policies (Settings → Actions → General)

### gh works but git push fails

**Cause:** `gh` and `git` use different auth mechanisms.

**Fix:** Configure git to use the token for HTTPS:
```bash
git config --global url."https://x-access-token:${GH_TOKEN}@github.com/".insteadOf "https://github.com/"
```

Or use `gh` as the git credential helper:
```bash
gh auth setup-git
```

### Rate limiting

**Cause:** Too many API calls in a short period.

**Fix:**
1. Check limits: `gh api rate_limit`
2. Add delays between bulk operations
3. Use GraphQL (`gh api graphql`) for batch queries instead of multiple
   REST calls
