# Pushing Your Branch and Opening a PR from a Worktree

You're on branch `feat/payments` inside a worktree — the process is identical
to a normal branch push, but a couple of things are worth confirming first.

---

## Step 1: Verify your working state

Inside your worktree directory, make sure everything is committed and your
branch is where you expect it:

```bash
git status          # should show nothing staged/unstaged if you're done
git log --oneline -5
```

---

## Step 2: Sync with main before pushing

Rebase onto the latest `main` to keep history linear and reduce merge
conflicts at review time:

```bash
git fetch origin
git rebase origin/main
```

If there are conflicts, resolve them file by file, then `git rebase --continue`.

---

## Step 3: Push the branch

Set the upstream tracking reference at the same time so future pushes in this
worktree need no arguments:

```bash
git push -u origin feat/payments
```

If you rebased after a previous push, use `--force-with-lease` instead — it's
safer than `--force` because it refuses to overwrite remote commits you
haven't fetched:

```bash
git push --force-with-lease
```

---

## Step 4: Open the PR with `gh`

Make sure `gh` is authenticated first:

```bash
gh auth status
```

If it isn't, run `gh auth login` and follow the prompts.

Then create the PR:

```bash
gh pr create \
  --title "feat(payments): <short description of what you built>" \
  --body "$(cat <<'EOF'
## Summary
- <What this PR does — 1–3 bullets>

## Notes
- Agent session: feat/payments
- Related: #<pr-number> (if any parallel PRs exist)

## Test plan
- [ ] <manual or automated tests to verify>
EOF
)"
```

Useful optional flags:

| Flag | When to use |
|------|-------------|
| `--base main` | If the repo default branch is not `main` |
| `--draft` | If you want reviewers to see it but not review yet |
| `--assignee @me` | Assign it to yourself |
| `--label payments` | Add a label (must exist in repo settings) |

---

## Step 5: Verify the PR was created

```bash
gh pr view          # shows the PR for the current branch
gh pr checks        # shows CI status
```

Watch CI until it resolves:

```bash
gh pr checks --watch
```

---

## If this is part of a parallel session

If other agents are working on related branches at the same time, note the
relationship in the PR body using GitHub's auto-link syntax:

```markdown
## Related PRs
- Related: #42 (parallel feature, independent)
- Depends on: #41 (must merge first — shared schema)
```

---

## After the PR merges

Once merged on GitHub, clean up locally (run this from the **main checkout**,
not inside the worktree):

```bash
git worktree remove ../myrepo-wt/feat/payments
git branch -d feat/payments
git worktree prune
git fetch --prune        # removes stale remote-tracking refs
```

If you used `--delete-branch` on the merge command (`gh pr merge --squash
--delete-branch`), the remote branch is already gone and `git fetch --prune`
will tidy the tracking reference.

---

## Summary of commands

```bash
# 1. Sync
git fetch origin && git rebase origin/main

# 2. Push
git push -u origin feat/payments

# 3. Open PR
gh pr create --title "feat(payments): ..." --body "..."

# 4. Monitor
gh pr checks --watch

# 5. After merge — from main checkout
git worktree remove ../myrepo-wt/feat/payments
git branch -d feat/payments
git worktree prune
```
