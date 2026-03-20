# Running Two Claude Sessions in Parallel Without Conflicts

The clean solution is **git worktrees** — one worktree per session, one branch per worktree. This gives each Claude session an isolated filesystem directory backed by the same git object store. No double-cloning, no disk waste, and no way for the two sessions to corrupt each other's git index.

## The Cardinal Rule

**One agent, one worktree, one branch.** Two agents sharing a worktree will corrupt each other's index (`.git/index.lock` errors). Two agents on the same branch will produce conflicting history. Keep them completely separate.

---

## Step-by-Step Setup

### 1. Create a worktree for each session

From your main repo directory, create two sibling worktrees — one for the auth feature and one for the API bug fix:

```bash
# From inside your repo (e.g., ~/projects/myrepo)

# Session 1: new auth feature
git worktree add ../myrepo-wt/feat/auth -b feat/auth

# Session 2: API bug fix
git worktree add ../myrepo-wt/fix/api-bug -b fix/api-bug
```

Your directory layout will look like this:

```
~/projects/
  myrepo/                  <- main checkout (main branch)
  myrepo-wt/
    feat/auth/             <- Claude session 1 works here
    fix/api-bug/           <- Claude session 2 works here
```

Both worktrees start at the current `HEAD` of main. If you want them to start from the latest `origin/main` explicitly:

```bash
git worktree add ../myrepo-wt/feat/auth -b feat/auth origin/main
git worktree add ../myrepo-wt/fix/api-bug -b fix/api-bug origin/main
```

### 2. Open two terminal windows (or Claude sessions)

Open each Claude session pointed at its dedicated directory. Give each session a clear brief at the start:

**Session 1 brief:**
```
Working directory: /home/user/projects/myrepo-wt/feat/auth
Branch: feat/auth
Task: Implement the new auth feature in src/auth/.
Do not touch src/api/ or any shared config files.
This session is independent — no upstream changes required first.
```

**Session 2 brief:**
```
Working directory: /home/user/projects/myrepo-wt/fix/api-bug
Branch: fix/api-bug
Task: Fix the null pointer bug in src/api/handler.ts.
Do not touch src/auth/.
This session is independent — no upstream changes required first.
```

The session brief must include the absolute working directory path so the agent never accidentally operates in the wrong place.

### 3. Let each session work independently

Each agent runs `git add`, `git commit` as normal inside its own worktree. Changes in `feat/auth` are invisible to the `fix/api-bug` session and vice versa.

### 4. Verify your worktrees at any time

```bash
git worktree list
```

Output will look like:
```
/home/user/projects/myrepo              abc1234 [main]
/home/user/projects/myrepo-wt/feat/auth    def5678 [feat/auth]
/home/user/projects/myrepo-wt/fix/api-bug  ghi9012 [fix/api-bug]
```

### 5. Push and open PRs for each session

From inside each worktree (or run from the main repo with explicit paths):

```bash
# Session 1
cd ~/projects/myrepo-wt/feat/auth
git push -u origin feat/auth
gh pr create \
  --title "feat(auth): implement new auth feature" \
  --body "Parallel session. Related: #<api-bug-pr-number> (if applicable)."

# Session 2
cd ~/projects/myrepo-wt/fix/api-bug
git push -u origin fix/api-bug
gh pr create \
  --title "fix(api): resolve null pointer in handler" \
  --body "Parallel session. Related: #<auth-pr-number> (if applicable)."
```

Consider opening both PRs as **drafts** immediately (`--draft` flag) — this makes the parallel work visible and signals reviewers that sessions are still in progress:

```bash
gh pr create --draft --title "..." --body "..."
# When done:
gh pr ready
```

---

## Avoiding Conflicts Between the Two Sessions

### File-level isolation (most important)

Assign each session to non-overlapping files or directories:

- Session 1 owns: `src/auth/`
- Session 2 owns: `src/api/`

If both sessions need to touch a shared file (e.g., `src/index.ts`, `routes.ts`):
- Assign the shared file to only one session.
- The other session imports from it but does not modify it.
- Or: run those changes sequentially, not in parallel.

### Watch out for conflict-prone shared files

These files are common sources of merge conflicts when edited in parallel — avoid parallelizing changes to them:

- `package.json` / `pnpm-lock.yaml` — only one session should install deps
- Auto-generated files (GraphQL types, OpenAPI clients) — regenerate once on main after all sessions merge
- Database schema files — always serialize these changes

### Before merging each PR

Rebase on the latest main to catch any conflicts before they reach review:

```bash
# Inside each worktree before marking the PR ready
git fetch origin
git rebase origin/main
git push --force-with-lease   # safe force-push after rebase
```

### Merge one PR at a time

Do not merge both PRs simultaneously. The first merge changes main, which may conflict with the second. After merging the first:

1. In the second worktree: `git fetch origin && git rebase origin/main`
2. Push: `git push --force-with-lease`
3. Then merge the second PR.

---

## Cleanup After Merging

Once a PR is merged, tear down its worktree from your main repo directory (not from inside the worktree):

```bash
# After feat/auth PR merges
git worktree remove ../myrepo-wt/feat/auth
git branch -d feat/auth
git worktree prune        # cleans up any stale metadata

# After fix/api-bug PR merges
git worktree remove ../myrepo-wt/fix/api-bug
git branch -d fix/api-bug
git worktree prune
```

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `fatal: 'branch' is already checked out` | Branch open in another worktree | Use a new branch name |
| `.git/index.lock` errors | Two processes on the same worktree | One session per worktree only |
| Detached HEAD | Created from a commit SHA without `-b` | Run `git switch -c <branch-name>` inside the worktree |
| Stale entries in `git worktree list` | Directory deleted with `rm -rf` instead of `git worktree remove` | Run `git worktree prune` |
| Agent edits files in the wrong location | Session not scoped to its worktree path | Re-brief the agent with the explicit absolute working directory |

---

## Summary

| Step | Command |
|------|---------|
| Create worktree for auth session | `git worktree add ../myrepo-wt/feat/auth -b feat/auth` |
| Create worktree for bug fix session | `git worktree add ../myrepo-wt/fix/api-bug -b fix/api-bug` |
| Brief each agent | Provide absolute path, branch name, task scope, and out-of-scope areas |
| Push and open PR | `git push -u origin <branch>` then `gh pr create` |
| Sync before merging | `git fetch origin && git rebase origin/main` |
| Clean up after merge | `git worktree remove <path> && git branch -d <branch> && git worktree prune` |

The key insight: worktrees isolate at the filesystem level while sharing the same git object store. Each Claude session sees only its own directory, commits only to its own branch, and communicates with you (and with the other session indirectly) through PRs — not through shared files.
