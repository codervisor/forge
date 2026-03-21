# Avoiding Merge Conflicts When Multiple Agent Sessions Touch the Same File

When two parallel agent sessions both modify `routes.ts`, you have a conflict waiting to happen. Here is how to handle it.

## Immediate Triage: Assess the Overlap

Before either session commits, understand what each one is changing in `routes.ts`:

- Are they adding new routes in the same area of the file?
- Are they modifying existing route definitions?
- Are they changing shared utilities, middleware, or types at the top of the file?

The answer determines your strategy.

## Option 1: Serialize One of the Sessions (Safest)

If both sessions are touching the same logical section of `routes.ts`, the cleanest approach is to let one session finish and merge first, then rebase the second session on top of the updated branch before it proceeds.

1. Pick one session as "first" — ideally the one making the simpler or more foundational change.
2. Let it complete, commit, and merge (or push its branch).
3. In the second worktree, run `git fetch` and rebase onto the updated base branch before that session makes further changes to `routes.ts`.
4. The second session then works from the already-updated file.

This eliminates the conflict entirely rather than resolving it after the fact.

## Option 2: Coordinate by File Section (If Changes Are in Different Areas)

If the two sessions are touching non-overlapping parts of `routes.ts` (e.g., one adds `/api/users/*` routes and the other adds `/api/orders/*` routes), the conflict risk is lower. You can:

- Let both sessions work independently.
- When merging, Git will often auto-merge cleanly if the changes are in different line ranges.
- Plan your merge order: merge the simpler change first, then merge the second branch after a quick rebase.

Even here, shared imports or a route registration block at the top of the file can still produce conflicts — watch for those.

## Option 3: Refactor Routes Before Parallelizing

The root cause is that `routes.ts` is a shared, monolithic file. The best long-term fix is to split it before running parallel sessions:

- Extract route groups into separate files: `userRoutes.ts`, `orderRoutes.ts`, etc.
- Have `routes.ts` only import and mount them.

With this structure, two sessions can each own a separate file with no overlap, making parallel work safe by design.

## Option 4: Designate an Integration Step

If you cannot serialize or refactor ahead of time, treat merging `routes.ts` as an explicit integration task:

1. Let both sessions complete their work on separate branches, accepting that `routes.ts` will conflict.
2. Create a dedicated integration branch.
3. Merge both branches into it.
4. Manually resolve the conflict in `routes.ts` once, with full context of what both sessions did.
5. Verify the result with tests before merging to the main branch.

This is more work, but it keeps each session unblocked.

## Practical Checklist

- [ ] Identify exactly which lines in `routes.ts` each session will touch before they start.
- [ ] If the sections overlap, serialize: finish and merge session A before session B edits `routes.ts`.
- [ ] If the sections are distinct, plan a rebase before merging the second branch.
- [ ] After any merge that touches `routes.ts`, run your route tests immediately to catch semantic conflicts (two routes registered at the same path, a missing import, etc.) that Git cannot detect.
- [ ] Consider whether splitting `routes.ts` into feature-scoped files is worth doing now to make future parallel work safer.

## Key Principle

Git conflicts in `routes.ts` are usually a symptom of insufficient upfront coordination. The most reliable fix is to ensure parallel sessions never need to write to the same file — either by dividing the file structure before parallelizing, or by serializing the sessions that cannot be cleanly divided.
