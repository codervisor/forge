# Avoiding a Merge Conflict Disaster When Two Agent Sessions Both Touch routes.ts

You have three agents in parallel worktrees, and two of them are both modifying `routes.ts`. This is the classic shared-file problem, and there is a clear set of options for handling it — from safest to most complex.

---

## The Core Problem

`routes.ts` is a conflict magnet because it is a single file that aggregates route definitions from across the codebase. When two branches both add or change lines in it, git cannot automatically reconcile them. You get a merge conflict at PR merge time, and the later-merging branch always bears the cost of resolving it.

The skill's cardinal principle applies here:

> When you can't avoid overlap on a shared file (e.g., `index.ts`, `routes.ts`): only one session touches the shared file. Other sessions import from it but don't modify it. Or: sequence the sessions that touch the shared file.

---

## Option 1: Assign routes.ts to One Session Only (Preferred)

This is the cleanest fix if you can act before the agents have done too much work.

**What to do:**

1. Decide which of the two sessions "owns" `routes.ts`. This is typically the one whose feature requires the most routing changes, or simply the one that started first.
2. Re-brief the other session with an explicit exclusion:

   ```
   Working directory: /home/user/myrepo-wt/feat/payments
   Branch: feat/payments
   Task: Implement the payments feature.
   Do NOT modify routes.ts. Instead, export a routeConfig object from
   packages/payments/src/routes.ts and the owner session will register it.
   ```

3. The owning session imports and registers the other session's route config, then commits `routes.ts` once.

This keeps `routes.ts` touched exactly once across all branches — zero conflict risk.

---

## Option 2: Sequence the Sessions That Touch routes.ts

If both sessions truly must own their own changes to `routes.ts` (e.g., they are structurally independent features), serialize the work that involves that file:

```
Session A (feat/auth):   runs fully, merges first
Session B (feat/billing): starts (or finishes) only after Session A merges
```

Workflow:

1. Let Session A finish and merge its PR — including its `routes.ts` edits.
2. In Session B's worktree, pull the merged changes:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

3. Now Session B edits `routes.ts` on top of Session A's changes. No conflict.

The third session (which doesn't touch `routes.ts`) is unaffected and can run freely in parallel the whole time.

---

## Option 3: Rebase Gate Before Merging (If Already Deep into Work)

If both sessions have already made substantial changes and re-scoping isn't practical, use a rebase gate at merge time:

1. Merge one PR first (pick the simpler or less risky one).
2. In the other session's worktree, immediately rebase:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

   Git will pause on `routes.ts` with a conflict marker. Resolve it manually (or have an agent resolve it with the full context of both branches in front of you).

3. Then:

   ```bash
   git rebase --continue
   git push --force-with-lease
   ```

4. Mark the second PR ready for review and merge.

**Important:** Do not merge both PRs simultaneously. The first merge changes main; the second PR must see that change before it lands. Merge one, rebase the other, then merge the second.

---

## Pre-Merge Checklist (Run Per Session Before Marking PR Ready)

- [ ] `git fetch origin && git rebase origin/main` — surface conflicts early, on your own timeline
- [ ] Run tests in the worktree
- [ ] Check whether any other open PR touches the same files:

  ```bash
  gh pr list --json number,title,files
  ```

  If another PR shows `routes.ts` in its file list, coordinate before merging.

---

## Summary: Which Option to Choose

| Situation | Best Option |
|-----------|-------------|
| You can re-scope before agents go deep | Option 1 — assign routes.ts to one session only |
| Sessions are mostly done, clearly sequential in intent | Option 2 — merge one first, then rebase and proceed |
| Sessions are mostly done, truly parallel features | Option 3 — rebase gate at merge time, resolve conflict once |

The overhead of restructuring up front (Option 1) is almost always less than the cost of resolving a messy merge conflict later. When in doubt, serialize the sessions that share a file rather than trying to coordinate them live.
