# Avoiding a Merge Conflict Disaster When Two Sessions Both Touch routes.ts

You have three agent sessions running in parallel worktrees, and two of them both need to modify `routes.ts`. This is a classic conflict magnet situation. Here is how to handle it cleanly.

## The Core Rule

**Only one session should own a shared file.** When two agents both modify the same file on different branches, you will face a merge conflict when their PRs land on main. The earlier merge is easy; the later one requires manual resolution. With AI-generated code this can be messy and error-prone.

---

## Your Options, From Best to Worst

### Option 1: Reassign Ownership — One Session Owns routes.ts (Recommended)

Before either session writes a single line, stop and redesign the scope:

1. Decide which session logically "owns" `routes.ts`. Usually this is the session whose work is more foundational — e.g., the one adding the new route structure, not the one adding a handler that uses it.
2. Re-brief both agents:
   - **Session A (owns routes.ts):** "Modify `routes.ts` to add the new route entries. Also complete your other work in `[your module]`."
   - **Session B (does not own routes.ts):** "Do not touch `routes.ts`. When your work is ready, the route registration will be handled separately."
3. Session B completes its work without touching `routes.ts`. After both PRs are reviewed, Session A's PR (which includes the `routes.ts` changes) merges first. Session B's PR gets rebased and then merged.

This is clean, requires no manual conflict resolution, and keeps each PR reviewable in isolation.

---

### Option 2: Sequence the Sessions That Touch the Shared File

If both sessions genuinely need to modify `routes.ts`, serialize that work:

1. **Run only one of the two conflicting sessions now.** Let it complete, open a PR, and merge.
2. After the first PR merges to main, start the second session:
   ```bash
   # Inside the second session's worktree
   git fetch origin
   git rebase origin/main
   ```
3. The second session now starts from a main that already has the first session's `routes.ts` changes — no conflict possible.

This is the safest path when the changes to `routes.ts` are substantive and interleaved.

---

### Option 3: Assign routes.ts to a Dedicated Third Session

If both changes to `routes.ts` are small additions (e.g., registering two new routes), consider pulling all `routes.ts` work out of both sessions and into a single focused session:

- Session A: Does everything except `routes.ts` changes
- Session B: Does everything except `routes.ts` changes
- Session C (new or repurposed): Only edits `routes.ts`, collecting the route registrations from the other two PRs as its specification

This works well when `routes.ts` is a pure registry file (no logic) and the two sessions' additions are independent lines.

---

### Option 4: Merge One First, Then Rebase the Other (Reactive)

If the sessions are already running and you can't stop them, here is how to recover:

1. Let both sessions finish and open their PRs.
2. **Merge the first PR** — whichever is simpler or more foundational.
3. In the second session's worktree, rebase onto the updated main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
4. Git will pause at the conflict in `routes.ts`. Resolve it manually (or with an agent), then:
   ```bash
   git add routes.ts
   git rebase --continue
   git push --force-with-lease
   ```
5. Merge the second PR.

This works but requires a human (or a review agent) to resolve the conflict correctly. It is the fallback, not the plan.

---

## Pre-Merge Checklist When Shared Files Are Involved

Before marking either PR ready to merge, run this check:

```bash
# Check which files each open PR touches
gh pr list --json number,title,files
```

If two open PRs both show `routes.ts` in their file lists, you have a conflict in waiting. Address it before merging anything.

Also rebase each session's branch against main just before merging:

```bash
git fetch origin && git rebase origin/main
git push --force-with-lease
```

---

## Summary Table

| Situation | Best approach |
|-----------|--------------|
| Sessions haven't started writing yet | Reassign ownership — only one session touches `routes.ts` |
| Sessions are running but haven't pushed | Re-brief the one that doesn't need to own it; remove `routes.ts` from its scope |
| Both sessions have open PRs | Merge one, rebase the other, resolve the conflict, then merge |
| `routes.ts` is just a route registry | Pull all `routes.ts` edits into a single dedicated session |

The overhead of stopping to reassign scope is always lower than the overhead of resolving a messy merge conflict in AI-generated code. When in doubt, serialize rather than coordinate.
