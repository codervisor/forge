# Pushing a Worktree Branch and Opening a PR on GitHub

Since you're working in a git worktree on `feat/payments`, the process is essentially the same as a normal branch — worktrees share the same git repository under the hood.

## Step 1: Make sure your changes are committed

Check that everything you want is staged and committed:

```bash
git status
git log --oneline -5
```

If you have uncommitted changes, commit them first.

## Step 2: Push the branch to the remote

```bash
git push -u origin feat/payments
```

The `-u` flag sets the upstream tracking reference, so future `git push` and `git pull` commands in this worktree won't need the remote/branch arguments.

If the branch was already pushed before and you just want to push new commits:

```bash
git push
```

## Step 3: Open a pull request

**Option A — Using the GitHub CLI (recommended):**

```bash
gh pr create --base main --head feat/payments --title "Add payments feature" --body "Description of changes"
```

Or run it interactively (it will prompt you for title, body, base branch, etc.):

```bash
gh pr create
```

**Option B — From the terminal output:**

After pushing, Git prints a URL you can open directly:

```
remote: Create a pull request for 'feat/payments' on GitHub by visiting:
remote:   https://github.com/<owner>/<repo>/pull/new/feat/payments
```

Copy that URL and open it in your browser.

**Option C — From the GitHub web UI:**

1. Go to your repository on GitHub.
2. GitHub usually shows a banner at the top: "feat/payments had recent pushes — Compare & pull request". Click it.
3. Fill in the title and description, set the base branch (usually `main` or `develop`), then click **Create pull request**.

## Common gotchas with worktrees

- Each worktree has its own working directory but shares the same `.git` directory and remote config, so `git push` works exactly as it would from the main working tree.
- If the branch name in your worktree is the same as the directory name, confirm you are on the right branch with `git branch --show-current` before pushing.
- Make sure you are not accidentally pushing from the wrong worktree if you have several open.

That's it — once the PR is open, you can request reviewers, add labels, and merge as usual.
