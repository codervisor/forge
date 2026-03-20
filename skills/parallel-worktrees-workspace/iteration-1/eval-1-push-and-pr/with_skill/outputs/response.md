# Pushing `feat/payments` and Opening a PR

You're inside a worktree on branch `feat/payments` and your changes are ready. Here is the full sequence.

---

## Step 1: Make sure your branch is up to date with main

Before pushing, sync with the latest `main` to avoid conflicts and keep history linear:

```bash
git fetch origin
git rebase origin/main
```

If the rebase surfaces conflicts, resolve them, then:

```bash
git add <resolved-files>
git rebase --continue
```

---

## Step 2: Push the branch to GitHub

From inside your worktree:

```bash
git push -u origin feat/payments
```

The `-u` flag sets the upstream tracking reference. After this, plain `git push` works in this worktree without arguments.

If you already pushed earlier and rebased in Step 1, use:

```bash
git push --force-with-lease
```

`--force-with-lease` is safer than `--force`: it refuses to overwrite remote commits you haven't fetched, preventing accidental data loss.

---

## Step 3: Verify `gh` is authenticated

```bash
gh auth status
```

If it isn't authenticated yet:

```bash
gh auth login
# Follow prompts: GitHub.com → HTTPS → Login with a web browser
```

---

## Step 4: Open the pull request

Run this from inside the worktree:

```bash
gh pr create \
  --title "feat(payments): <short description of what you built>" \
  --body "$(cat <<'EOF'
## Summary
- <What this PR does — 1 to 3 bullets>

## Notes
- Agent session: feat/payments
- Related work: #<pr-number> (if any parallel sessions are in flight)

## Test plan
- [ ] <manual or automated test steps>
EOF
)"
```

### Useful optional flags

| Flag | When to use |
|------|-------------|
| `--base <branch>` | If the target branch isn't the repo default (e.g., `--base develop`) |
| `--draft` | If you want to signal the PR is not yet ready for review |
| `--assignee @me` | Assign yourself automatically |
| `--label <label>` | Add a label (must exist in repo settings) |

---

## Step 5 (optional): Open as a draft, promote when ready

If you want to publish the PR now but mark it work-in-progress:

```bash
gh pr create --draft --title "..." --body "..."
```

When you're ready for review:

```bash
gh pr ready
```

---

## Step 6: Check CI status

After opening the PR, watch your CI checks:

```bash
gh pr checks          # one-time view
gh pr checks --watch  # poll until all checks resolve
```

---

## What happens after the PR merges

Once it's merged on GitHub, clean up the worktree from your main repo checkout (not from inside the worktree):

```bash
# Remove the worktree directory
git worktree remove ../myrepo-wt/feat/payments

# Delete the local branch
git branch -d feat/payments

# Prune stale metadata
git worktree prune

# Prune stale remote tracking refs
git fetch --prune
```

If you used `--delete-branch` when merging (`gh pr merge --squash --delete-branch`), the remote branch is already gone and `git fetch --prune` will clean up the tracking ref.

---

## Quick reference: the whole flow at a glance

```bash
# 1. Sync with main
git fetch origin && git rebase origin/main

# 2. Push
git push -u origin feat/payments

# 3. Open PR
gh pr create --title "feat(payments): ..." --body "..."

# 4. Watch CI
gh pr checks --watch
```

That's it. Your branch is published and a PR is open for review.
