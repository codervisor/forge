# Avoiding Merge Conflicts with Parallel Agent Sessions in the Same File

When two agent sessions in separate worktrees both need to modify `routes.ts`, you have a few concrete strategies to prevent or minimize conflict pain.

## 1. Coordinate Before Writing (Best Option)

The most reliable approach is to prevent the conflict before it happens. Before either session starts editing `routes.ts`, decide which session "owns" it:

- **Assign ownership explicitly.** Have one session handle all changes to `routes.ts`. The other session makes its route-related changes in a separate file (e.g., a new feature module) and then the owning session integrates them.
- **Serialize the touches.** If both sessions truly need to edit `routes.ts`, run them sequentially on that file rather than in parallel. Finish one branch, merge it to main, then start the second session.

## 2. Partition the File

If the two sessions are adding different routes (e.g., one adds `/users/*` routes, the other adds `/payments/*` routes), structure `routes.ts` to make conflicts less likely:

- Split `routes.ts` into feature-specific sub-files (`user-routes.ts`, `payment-routes.ts`) and have `routes.ts` only import and compose them.
- Each session then edits a different sub-file, and only one session touches the thin `routes.ts` aggregator (or the aggregator changes are trivial and merge cleanly).

## 3. Rebase One Branch on Top of the Other

If both sessions have already made commits that touch `routes.ts`:

1. Merge or rebase the simpler/smaller branch first.
2. Rebase the second branch on top of the merged result.
3. Resolve any conflicts in a single, focused merge step rather than dealing with a three-way mess later.

```bash
# In worktree B, after worktree A's branch is merged to main:
git fetch origin
git rebase origin/main
# Resolve conflicts in routes.ts here, then:
git add routes.ts
git rebase --continue
```

## 4. Use a Feature Flag or Intermediate Interface

If the sessions are building independent features that happen to register routes in the same place, introduce an indirection:

- Use a route registry pattern where each feature registers itself (e.g., `registerRoutes(app)` called from each feature module).
- `routes.ts` just calls each feature's registration function and never needs to be touched again when adding new routes.

## 5. If a Conflict Already Happened

When you end up with a conflict anyway:

- Open the conflicted `routes.ts` and look at both sides carefully — route registrations are usually independent lines, so the merge is often straightforward (keep both sets of routes).
- Use a three-way diff tool (`git mergetool`, VS Code merge editor, or similar) rather than editing the raw conflict markers directly.
- After resolving, run your route tests before committing to confirm nothing was dropped or duplicated.

## Summary

| Situation | Recommended Action |
|---|---|
| Sessions haven't started editing yet | Assign one session as the owner of `routes.ts` |
| Routes are logically separate | Split `routes.ts` into feature sub-files first |
| Both sessions already have commits | Merge one first, rebase the other on top |
| Conflict already exists | Use three-way merge tool; routes are usually independent lines |
| Long-term prevention | Use a route registry pattern so `routes.ts` rarely needs direct edits |

The core principle: **conflicts happen when two sessions edit the same lines**. Either prevent that through ownership/partitioning, or reduce blast radius by keeping each route registration on its own line (making auto-merge more likely to succeed).
