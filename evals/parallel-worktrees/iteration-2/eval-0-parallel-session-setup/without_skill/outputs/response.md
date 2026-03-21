# Running Two Claude Sessions in Parallel Without Conflicts

The key challenge with parallel Claude sessions is that both agents share the same working directory and git state by default. If one session checks out a branch or modifies files while the other is working, they will clobber each other.

The cleanest solution is **git worktrees**.

## Use Git Worktrees

A git worktree lets you check out multiple branches simultaneously, each in its own directory on disk, while sharing the same underlying repository (object store, remotes, etc.). Each Claude session gets its own working directory and branch — no conflicts.

### Step 1: Create a worktree for each task

```bash
# From your main repo directory

# Worktree for the auth feature (new branch)
git worktree add ../myproject-auth -b feature/auth

# Worktree for the API bug fix (new branch)
git worktree add ../myproject-bugfix -b fix/api-bug
```

This creates two sibling directories:
- `../myproject-auth` — checked out on `feature/auth`
- `../myproject-bugfix` — checked out on `fix/api-bug`

Both share git history with the original repo but have completely independent working trees and indexes.

### Step 2: Open each Claude session in its own directory

Start one Claude Code session pointing at the auth worktree:

```bash
cd ../myproject-auth
claude
```

Start a second Claude Code session pointing at the bugfix worktree (in a separate terminal):

```bash
cd ../myproject-bugfix
claude
```

Each session now operates in isolation. File edits, staged changes, and commits in one directory have no effect on the other.

## Why This Works

- **No branch conflicts**: each worktree is on its own branch; checking out or committing in one does not disturb the other.
- **No file conflicts**: the working trees are separate directories, so file edits are fully isolated.
- **Shared history**: both worktrees see the same commits, tags, and remotes, so merging or rebasing later is straightforward.
- **No repo duplication**: unlike `git clone`, worktrees share the object store, so you are not duplicating gigabytes of history.

## Practical Tips

- Give each worktree a descriptive directory name that matches the task so it is obvious which terminal belongs to which session.
- If your project has a `node_modules`, `target`, build cache, or other dependency directory, you will need to install/build dependencies independently in each worktree directory — they are not shared.
- When both sessions are done, clean up:

```bash
git worktree remove ../myproject-auth
git worktree remove ../myproject-bugfix
```

- If you need to coordinate (e.g., the auth feature depends on the bug fix), finish and merge the bug fix branch first, then rebase the auth feature branch on top of it.

## Alternative: Separate Clones

If worktrees feel unfamiliar, you can also clone the repo twice into separate directories. The downside is that the clones are fully independent — commits in one are not immediately visible in the other without pushing/fetching. For short-lived parallel sessions, this usually does not matter, but worktrees are cleaner.

## Summary

| Approach | Isolation | Shared history | Setup effort |
|---|---|---|---|
| Git worktrees (recommended) | Full | Yes | Low |
| Separate clones | Full | No (until push/fetch) | Low |
| Same directory, same branch | None | Yes | None (but breaks) |

Use `git worktree add` to create one directory per Claude session, open each session in its respective directory, and let them run independently.
