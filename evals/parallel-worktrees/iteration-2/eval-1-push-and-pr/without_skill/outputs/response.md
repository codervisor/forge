# Pushing a Branch and Opening a PR from a Git Worktree

Since you're working in a worktree on `feat/payments`, the process is essentially the same as in a regular checkout — git operations work normally from within the worktree directory.

## Step 1: Verify your current state

Make sure you're in the worktree directory and check what you have:

```bash
git status
git log --oneline -5
```

Confirm you're on `feat/payments` and all your changes are committed.

## Step 2: Stage and commit any remaining changes

If you have uncommitted changes:

```bash
git add <files>
git commit -m "feat(payments): your commit message"
```

## Step 3: Push the branch to the remote

```bash
git push -u origin feat/payments
```

The `-u` flag sets the upstream tracking reference so future `git push` / `git pull` commands work without specifying the remote and branch.

If the branch already exists on the remote and you just need to push new commits:

```bash
git push
```

## Step 4: Open a Pull Request

### Option A — GitHub CLI (recommended)

```bash
gh pr create --base main --head feat/payments --title "feat(payments): <short description>" --body "$(cat <<'EOF'
## Summary
- <bullet point describing what changed>

## Test plan
- [ ] <manual or automated test steps>
EOF
)"
```

This creates the PR without leaving the terminal. After it runs, it prints the PR URL.

### Option B — Web browser

After pushing, GitHub usually displays a banner like:

> "feat/payments had recent pushes — Compare & pull request"

Click that button, fill in the title and description, set the base branch to `main` (or whatever your target is), and submit.

## Tips specific to worktrees

- Your worktree has its own working directory but shares the `.git` object store with the main checkout. All git and `gh` commands work identically inside it.
- If you have multiple worktrees open simultaneously, make sure you're running commands from the correct worktree path to avoid operating on the wrong branch.
- After the PR is merged and you no longer need the worktree, you can clean it up with:

```bash
# From the main repo directory (not inside the worktree)
git worktree remove <path-to-worktree>
git branch -d feat/payments
```
