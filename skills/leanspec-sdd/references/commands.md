# Command Reference

Complete reference for LeanSpec CLI commands. For quick help, run `lean-spec --help` or `lean-spec <command> --help`.

## Discovery

```bash
lean-spec board                      # Kanban view with project health
lean-spec list                       # List all specs
lean-spec list --hierarchy           # List with parent/child hierarchy
lean-spec search "query"             # Full-text search
lean-spec view <spec>                # Formatted view
lean-spec view <spec> --raw          # Raw markdown
lean-spec view <spec> --json         # Structured JSON
lean-spec view <spec>/DESIGN.md      # View sub-spec file
lean-spec files <spec>               # List all files (including sub-specs)
lean-spec open <spec>                # Open in editor
```

## Project Overview

```bash
lean-spec board                      # Kanban view
lean-spec board --group-by status    # Group by status (default)
lean-spec board --group-by parent    # Group by umbrella parent
lean-spec stats                      # Quick metrics
lean-spec stats --full               # Detailed analytics
```

## Spec Lifecycle

### Create
```bash
lean-spec create <name>
lean-spec create <name> --title "Human Title"
lean-spec create <name> --template default
lean-spec create <name> --status planned
lean-spec create <name> --priority high
lean-spec create <name> --tags api,backend
lean-spec create <name> --parent 250
lean-spec create <name> --depends-on 210 211
lean-spec create <name> --assignee "Name"
```

### Update Metadata
**REQUIRED — Never manually edit frontmatter fields**

```bash
lean-spec update <spec> --status in-progress
lean-spec update <spec> --priority high
lean-spec update <spec> --assignee "Name"
lean-spec update <spec> --add-tags api,backend
lean-spec update <spec> --remove-tags old-tag
lean-spec update <spec> --status complete          # Verifies checklist
lean-spec update <spec> --status complete --force   # Skip verification

# Combine multiple updates
lean-spec update <spec> --status in-progress --priority high

# Batch update
lean-spec update 001-feature-a 002-feature-b --status in-progress
```

### Archive
```bash
lean-spec archive <spec>
lean-spec archive 001-feature-a 002-feature-b
lean-spec archive <spec> --dry-run
```

## Relationships

Use `rel` as the primary relationship command.

```bash
# View relationships for one spec
lean-spec rel <spec>

# Parent/child relationships
lean-spec rel add <child> --parent <parent>
lean-spec rel add <parent> --child <child-a> <child-b>
lean-spec rel rm <child> --parent
lean-spec children <parent>

# Dependencies
lean-spec rel add <spec> --depends-on <other-spec>
lean-spec rel rm <spec> --depends-on <other-spec>

# Dependency graph traversal
lean-spec deps <spec>
lean-spec deps <spec> --upstream
lean-spec deps <spec> --downstream
lean-spec deps <spec> --depth 5
```

## Validation & Analysis

```bash
lean-spec validate                   # Validate all specs
lean-spec validate <spec>            # Validate specific spec
lean-spec validate --check-deps
lean-spec validate --strict
lean-spec validate --warnings-only

lean-spec tokens                     # All specs by token count
lean-spec tokens <spec>              # Count tokens in spec
lean-spec tokens <file-path>         # Count tokens in any file
lean-spec tokens <spec> --verbose    # Show detailed breakdown

lean-spec analyze <spec>             # Human-readable analysis
lean-spec analyze <spec> --json      # JSON output for parsing
```

## Spec Splitting

**Use when spec exceeds 3,500 tokens**

```bash
# Extract sections to sub-spec files
lean-spec split <spec> --output "DESIGN.md:100-250"
lean-spec split <spec> --output "API.md:251-400" --update-refs

# Remove extracted sections from main README
lean-spec compact <spec> --remove "100-250"
lean-spec compact <spec> --remove "100-250" --remove "300-400"

# Dry run
lean-spec split <spec> --output "TESTING.md:401-520" --dry-run
lean-spec compact <spec> --remove "100-250" --dry-run
```

## Backfill & Utilities

```bash
lean-spec backfill --dry-run                        # Preview
lean-spec backfill --force                          # Apply changes
lean-spec backfill --force --assignee --transitions # Full backfill
lean-spec backfill 042 043                          # Specific specs

lean-spec check                      # Detect conflicts/naming issues
lean-spec check --fix                # Auto-fix issues
lean-spec templates --action list    # List available templates
```

## Tooling & Environment

```bash
lean-spec init                       # Initialize project
lean-spec init --yes                 # Non-interactive
lean-spec init --skill               # Install skill only

lean-spec mcp                        # Start MCP server
lean-spec ui --port 3000             # Start UI server
lean-spec ui --no-open               # Start without opening browser
```

## Output Format

Most commands support:
```bash
lean-spec <command> ... -o text
lean-spec <command> ... -o json
```

## Notes

- CLI uses kebab-case flags (`--check-deps`, `--group-by`).
- Prefer `rel` for relationship updates; use `children` and `deps` for focused read views.
- `files` supports `--size` (there is no `--type` flag).
