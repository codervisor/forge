# Workflow Examples

Detailed workflow examples and patterns for working with LeanSpec.

## Spec-Driven Development (SDD) Workflow

The core workflow for implementing features with LeanSpec:

### 1. Discover
Check existing specs before starting:
```bash
lean-spec list
lean-spec search "authentication"
```

### 2. Plan
Create spec with clear intent:
```bash
lean-spec create user-authentication \
  --title "User Authentication System" \
  --priority high \
  --tags auth,security
```

Status starts as `planned` automatically.

### 3. Start Work
**BEFORE implementing**, update status:
```bash
lean-spec update user-authentication --status in-progress
```

### 4. Implement
Write code/docs, keep spec in sync as you learn:
- Document design decisions in the spec
- Update implementation notes based on learnings
- Link related specs as dependencies emerge

### 5. Complete
**AFTER implementation is done**, mark complete:
```bash
lean-spec update user-authentication --status complete
```

## Managing Spec Complexity

### Check Token Count
```bash
lean-spec tokens my-spec
# Output: Total: 3,800 tokens ⚠️
```

### Analyze and Split
When spec exceeds 3,500 tokens:

```bash
# 1. Analyze structure
lean-spec analyze my-spec --json

# 2. Identify heavy sections (example output):
# Lines 100-250: "Detailed Architecture" (850 tokens)
# Lines 300-450: "Test Strategy" (600 tokens)

# 3. Extract to sub-specs
lean-spec split my-spec --output "DESIGN.md:100-250"
lean-spec split my-spec --output "TESTING.md:300-450"

# 4. Compact main README
lean-spec compact my-spec --remove "100-250" --remove "300-450"

# 5. Verify result
lean-spec tokens my-spec
# Output: 1,800 tokens ✅
```

## Frontmatter Management

**CRITICAL RULE: Never manually edit system-managed frontmatter**

**System-managed fields:**
- `status`, `priority`, `tags`, `assignee`
- `transitions`, `created_at`, `updated_at`, `completed_at`
- `depends_on`, `related`

**Always use CLI commands:**
```bash
# ✅ CORRECT
lean-spec update <spec> --status in-progress
lean-spec update <spec> --priority high
lean-spec update <spec> --tags api,backend
lean-spec rel add <spec> --depends-on other-spec

# ❌ WRONG - Will cause metadata corruption
# Opening README.md and editing frontmatter directly
```

## Common Patterns

### Feature Implementation
```bash
# 1. Create and plan
lean-spec create payment-integration --priority high --tags backend,api

# 2. Start work
lean-spec update payment-integration --status in-progress

# 3. Link dependencies
lean-spec rel add payment-integration --depends-on user-authentication

# 4. Check impact
lean-spec deps payment-integration

# 5. Complete
lean-spec update payment-integration --status complete
```

### Coordinated Work Across Specs
```bash
# Launch depends on multiple features
lean-spec rel add product-launch --depends-on payment-integration
lean-spec rel add product-launch --depends-on user-dashboard
lean-spec rel add product-launch --depends-on dark-theme-support

# View full dependency graph
lean-spec deps product-launch
```

## Parallel Development with Git Worktrees

Need to work on multiple specs simultaneously? Use Git worktrees for complete code isolation.

### Why Git Worktrees?

- **Native Git feature** — No additional tools required
- **Complete isolation** — Each worktree has independent working directory
- **Shared history** — Efficient disk usage, all worktrees share `.git`
- **No context switching** — Work on multiple specs without stashing/committing

### Basic Setup

```bash
# Main repo structure after creating worktrees:
~/project/                    # Primary worktree (main branch)
~/project/.worktrees/
  ├── spec-045-dashboard/     # Worktree for spec 045
  ├── spec-047-timestamps/    # Worktree for spec 047
  └── spec-048-analysis/      # Worktree for spec 048
```

### Pattern: Solo Developer — Parallel Features

```bash
# Start spec 045
lean-spec update 045 --status in-progress
git worktree add .worktrees/spec-045-dashboard -b feature/045-dashboard
cd .worktrees/spec-045-dashboard
# Implement spec 045...

# While 045 is ongoing, start spec 047 in parallel
cd ~/project  # Back to main worktree
lean-spec update 047 --status in-progress
git worktree add .worktrees/spec-047-timestamps -b feature/047-timestamps
cd .worktrees/spec-047-timestamps
# Implement spec 047...

# Merge and clean up when done
git worktree remove .worktrees/spec-045-dashboard
```

### Pattern: Branching from Dependencies

When specs have dependencies (`depends_on`):

```bash
# Spec 048 depends on 045
# Option 1: Wait for 045 to merge to main
git worktree add .worktrees/spec-048 -b feature/048

# Option 2: Branch from 045's feature branch (when 045 not yet merged)
git worktree add .worktrees/spec-048-analysis feature/045-dashboard -b feature/048-from-045
```

### Best Practices

1. **Worktree naming**: Use spec number + short name (e.g., `spec-045-dashboard`)
2. **Branch strategy**: Feature branches per spec (e.g., `feature/045-dashboard`)
3. **Cleanup**: Remove worktrees after merge (`git worktree remove <path>`)
4. **Status updates**: Update spec status from main worktree where `specs/` lives
5. **Dependencies**: Branch from dependent spec's feature branch if needed
6. **Ignore worktrees**: Add `.worktrees/` to `.gitignore`

## Quality Validation Workflow

Before completing work:

```bash
# 1. Validate specs
lean-spec validate

# 2. Run project tests
# (project-specific commands)

# 3. Mark complete
lean-spec update <spec> --status complete
```

## Project Health Monitoring

### Quick Overview
```bash
lean-spec board              # Kanban view
lean-spec stats              # Quick metrics
```

### Detailed Analysis
```bash
lean-spec stats --full       # All analytics
lean-spec tokens             # All specs by token count
lean-spec validate           # Check for issues
```
