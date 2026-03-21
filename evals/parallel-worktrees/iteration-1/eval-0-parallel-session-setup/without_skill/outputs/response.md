# Running Two Claude Sessions in Parallel Without Conflicts

The core problem is that two Claude sessions writing to the same working directory will step on each other — editing the same files, leaving conflicting staged changes, and producing merge conflicts. The solution is to give each session its own isolated workspace.

## The Recommended Approach: Git Worktrees

Git worktrees let you check out multiple branches from the same repository simultaneously, each in its own directory. This is the cleanest solution for running parallel Claude sessions.

### Setup

```bash
# From your main repo directory
git worktree add ../my-repo-auth feature/auth
git worktree add ../my-repo-bugfix fix/api-bug
```

This creates two new directories alongside your main repo:
- `../my-repo-auth` — checked out on branch `feature/auth`
- `../my-repo-bugfix` — checked out on branch `fix/api-bug`

Each directory shares the same `.git` history and object store, but has its own working tree, index (staging area), and HEAD. Changes in one directory do not affect the other.

### Running the Sessions

Open two terminals (or two editor windows):

**Terminal 1 — auth feature:**
```bash
cd ../my-repo-auth
# Start Claude session here, pointed at this directory
```

**Terminal 2 — API bug fix:**
```bash
cd ../my-repo-bugfix
# Start Claude session here, pointed at this directory
```

Each Claude session operates entirely within its own directory. There is no shared working tree, no shared index, and no risk of one session's uncommitted changes being visible to the other.

### Cleaning Up

When you are done, remove the worktrees:

```bash
git worktree remove ../my-repo-auth
git worktree remove ../my-repo-bugfix
```

Or, if you have already deleted the directories manually:

```bash
git worktree prune
```

---

## Why Not Just Use Two Branches in the Same Directory?

You might think you can just stash, switch branches, and run the second session. You cannot do this safely in parallel:

- Both sessions would share the same working tree and staging area
- Switching branches mid-session would discard or corrupt the other session's in-progress work
- File watchers, build caches, and editors would get confused by branch switches

Worktrees avoid all of this because each session has a physically separate directory.

---

## Alternative: Separate Clones

If worktrees feel unfamiliar, you can clone the repo twice:

```bash
git clone . ../my-repo-auth
git clone . ../my-repo-bugfix
```

Then check out the appropriate branch in each clone. This works but wastes disk space and makes it harder to share commits between the two workspaces without going through a remote.

---

## Practical Tips

- **Name your worktree directories clearly** after the branch or task so it is obvious which Claude session belongs where.
- **Commit frequently in each session.** Because worktrees share the object store, once you commit in one worktree the commit is immediately available to cherry-pick or merge in the other.
- **Avoid the same file in both sessions simultaneously.** Worktrees prevent working-tree conflicts, but if both sessions modify the same file on different branches you will still need to resolve a merge conflict when you integrate. Plan your task boundaries to minimize overlap.
- **Dependencies and build artifacts** (e.g., `node_modules`, `target/`) are per-worktree. You may need to run install/build steps in each worktree independently.

---

## Summary

| Approach | Isolation | Disk usage | Shared history |
|---|---|---|---|
| Git worktrees | Full (separate working tree + index) | Low (shared object store) | Yes, immediate |
| Separate clones | Full | Higher (duplicated objects) | Via remote push/pull |
| Same directory, different branches | None — unsafe for parallel use | Lowest | Yes |

**Use git worktrees.** One worktree per Claude session, one branch per task. This is the standard, safe way to run parallel coding sessions without conflicts.
