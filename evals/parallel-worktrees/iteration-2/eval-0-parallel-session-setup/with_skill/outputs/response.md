# Running Two Claude Sessions in Parallel Without Conflicts

The clean solution is **git worktrees** — one worktree per agent session, one branch per worktree. Each Claude session works in its own isolated directory, commits to its own branch, and opens its own PR. They never touch each other's files.

## The Cardinal Rule

**One agent, one worktree, one branch.** Two agents sharing a worktree will corrupt each other's git index (`.git/index.lock` errors). Two agents on the same branch will produce conflicting history. Keep them fully separated at the filesystem level.

---

## Step-by-Step Setup

### 1. Decide on names and paths

For your scenario:
- Auth feature: branch `feat/auth/jwt-login`, worktree at `../myrepo-wt/feat/auth`
- API bug fix: branch `fix/api/null-pointer`, worktree at `../myrepo-wt/fix/api-bug`

Keep worktrees as **siblings** of your repo root to avoid `.gitignore` noise:

```
~/projects/
  myrepo/              <- main checkout (main branch)
  myrepo-wt/
    feat/auth/         <- Claude session 1 works here
    fix/api-bug/       <- Claude session 2 works here
```

### 2. Create both worktrees

Run these from your main repo directory:

```bash
# Create worktree for the auth feature
git worktree add ../myrepo-wt/feat/auth -b feat/auth/jwt-login origin/main

# Create worktree for the API bug fix
git worktree add ../myrepo-wt/fix/api-bug -b fix/api/null-pointer origin/main
```

Each command creates the directory, creates the branch, and checks it out. Both branches start from `origin/main`.

Verify the setup:

```bash
git worktree list
# Output:
# /home/user/myrepo                        abc1234 [main]
# /home/user/myrepo-wt/feat/auth           def5678 [feat/auth/jwt-login]
# /home/user/myrepo-wt/fix/api-bug         ghi9012 [fix/api/null-pointer]
```

### 3. Open two terminal windows (or agent sessions)

Each Claude session needs to be pointed at its own worktree. Give each agent an explicit brief:

**Session 1 brief (auth feature):**
```
Working directory: /home/user/myrepo-wt/feat/auth
Branch: feat/auth/jwt-login
Task: Implement JWT authentication in src/auth/*.ts
Do not modify src/api/ or any database schema files.
This session is independent — no upstream merges required.
```

**Session 2 brief (API bug fix):**
```
Working directory: /home/user/myrepo-wt/fix/api-bug
Branch: fix/api/null-pointer
Task: Fix the null pointer bug in src/api/handler.ts
Do not modify src/auth/ or any schema files.
This session is independent — no upstream merges required.
```

The agent operates entirely within its assigned directory. It should have no awareness of the other worktree.

### 4. Let both sessions work normally

Inside each worktree, Claude uses normal git commands (`git add`, `git commit`) as usual. Commits go to the worktree's own branch and stay isolated from main and from each other.

### 5. Push and open PRs

When each session completes, push its branch and open a PR:

```bash
# From inside the auth worktree (or pass -C path from anywhere)
git push -u origin feat/auth/jwt-login
gh pr create \
  --title "feat(auth): implement JWT login" \
  --body "Parallel session. Related: #<api-bug-pr-number> (if any)."
```

```bash
# From inside the API bug worktree
git push -u origin fix/api/null-pointer
gh pr create \
  --title "fix(api): resolve null pointer in handler" \
  --body "Parallel session. Related: #<auth-pr-number> (if any)."
```

If a session is still in progress when you push, open it as a **draft** PR to signal it's not ready for review yet:

```bash
gh pr create --draft --title "..." --body "..."
# Mark ready when done:
gh pr ready
```

---

## Are These Sessions Truly Independent?

Before running in parallel, check for potential conflicts. Your auth feature and API bug fix are good candidates for true parallelism **if they touch different files**. Ask:

- Does the auth feature modify any files in the API code path? If yes, assign that shared file to one session only.
- Do both touch `package.json`, lock files, or any auto-generated files? If yes, only one session should install dependencies.

If they're completely in separate directories (e.g., `src/auth/` vs `src/api/`), they can run simultaneously with no risk of conflict.

| Scenario | Recommendation |
|----------|----------------|
| Auth code and API code in separate modules | True parallel — run both at once |
| Both modify a shared `routes.ts` or `index.ts` | Sequential, or assign the shared file to one session |
| Both need `package.json` changes | Sequential for the dep install step |

---

## Merging When Both Are Done

Merge one PR at a time — don't merge both simultaneously, because the first merge changes `main` and the second PR needs to rebase on it.

1. Merge one PR on GitHub (squash merge keeps history clean):
   ```bash
   gh pr merge <pr-number> --squash --delete-branch
   ```
2. In the other worktree, rebase on the updated main:
   ```bash
   git fetch origin
   git rebase origin/main
   git push --force-with-lease
   ```
3. Merge the second PR.

---

## Cleaning Up

After both PRs are merged:

```bash
# From the main repo directory (not inside a worktree)
git worktree remove ../myrepo-wt/feat/auth
git worktree remove ../myrepo-wt/fix/api-bug
git branch -d feat/auth/jwt-login
git branch -d fix/api/null-pointer
git worktree prune        # cleans up any stale metadata
git fetch --prune         # cleans up stale remote tracking refs
```

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `fatal: 'branch' is already checked out` | Branch already open in another worktree | Use a new branch name |
| `.git/index.lock` errors | Two processes running in the same worktree | Enforce one agent per worktree |
| Detached HEAD | Created worktree from a commit SHA, not a branch | `git switch -c <new-branch>` inside the worktree |
| Stale entry after directory deleted | Directory was `rm -rf`'d instead of using `git worktree remove` | `git worktree prune` |
| Agent edits files in the main checkout | Agent wasn't scoped to the worktree path | Re-brief agent with the explicit absolute working directory |

---

## Summary

1. `git worktree add` creates an isolated directory per session.
2. Each Claude session gets a brief: absolute working directory, branch name, what to do, what not to touch.
3. Sessions commit normally to their own branches.
4. PRs are the coordination channel — note related PRs in the description.
5. Merge one at a time, rebasing the second before it merges.
6. Clean up with `git worktree remove` + `git branch -d` + `git worktree prune`.
