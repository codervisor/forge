# Troubleshooting Reference

## Platform Package Not Found on npm

**Symptom**: `publish-main-packages` fails with "platform package not available"

**Causes & Fixes**:
1. **Registry propagation delay** — npm takes 10-60s to propagate
   - Wait and retry: `npm view @scope/cli-darwin-arm64@0.2.16`
   - The `wait-propagation` step handles this automatically
   
2. **Platform package publish failed** — check CI logs for `publish-platform-packages` step
   - Look for: 403 (auth), 409 (version exists), network errors
   
3. **Version mismatch** — platform and main packages have different versions
   - Run `sync-versions.ts` before publishing
   - Check all package.json files have same version

## workspace:* Leaked into Published Package

**Symptom**: `npm install` fails with "No matching version found for workspace:*"

**Causes & Fixes**:
1. **prepare-publish didn't run** — run it before `npm publish`
2. **New dependency added** — update workspace package map in `prepare-publish.ts`
3. **validate-no-workspace-protocol** should catch this pre-publish

**Recovery**:
```bash
# Unpublish the broken version (within 72h)
npm unpublish @scope/my-cli@0.2.16

# Fix and republish
pnpm tsx scripts/prepare-publish.ts
pnpm tsx scripts/validate-no-workspace-protocol.ts
npm publish
pnpm tsx scripts/restore-packages.ts
```

## Binary Not Executable After Install

**Symptom**: `Permission denied` when running the installed CLI

**Causes & Fixes**:
1. **postinstall.js didn't run** — npm may skip postinstall in some configs
   - Manual fix: `chmod +x node_modules/@scope/cli-darwin-arm64/my-cli`
   
2. **postinstall.js missing** — regenerate manifests
   - `pnpm tsx scripts/generate-platform-manifests.ts`

3. **npm --ignore-scripts** — user installed with scripts disabled
   - Re-install without the flag

## Wrong Binary for Platform

**Symptom**: Binary crashes with "exec format error" or similar

**Causes & Fixes**:
1. **Incorrect os/cpu in package.json** — check platform manifest
   ```bash
   cat node_modules/@scope/cli-darwin-arm64/package.json | jq '{os, cpu}'
   ```
   
2. **Binary copied to wrong directory** — check `copy-platform-binaries.sh`

3. **Cross-compilation issue** — binary compiled for wrong target
   ```bash
   file node_modules/@scope/cli-darwin-arm64/my-cli
   # Should show: Mach-O 64-bit executable arm64
   ```

## Version Already Published

**Symptom**: `npm ERR! 403 - You cannot publish over the previously published versions`

**Causes & Fixes**:
1. **Forgot to bump version** — run `npm version patch` in root
2. **CI re-run on same version** — version is deterministic per run_id, so re-runs are safe
3. **Dev version collision** — shouldn't happen with run_id suffix

## CI Environment Required

**Symptom**: "This script must be run in a CI environment"

**Causes & Fixes**:
- Publish scripts require `CI=true` or `GITHUB_ACTIONS=true`
- For local testing: `--allow-local` flag
- For dry run: `--dry-run --allow-local`

## Binary Validation Failed

**Symptom**: "Invalid binary header" or "Binary file not found"

**Causes & Fixes**:
1. **Binary not compiled** — check Rust build step in CI
2. **Binary not copied** — check `copy-platform-binaries.sh` output
3. **Corrupt binary** — rebuild
4. **Wrong format** — ensure correct Rust target triple

**Manual validation**:
```bash
# Check binary format
file path/to/binary

# Check first bytes
xxd -l 4 path/to/binary
# darwin: cffa edfe or feed facf
# linux:  7f45 4c46
# windows: 4d5a
```

## npm Auth Issues

**Symptom**: 401 or 403 during publish

**Causes & Fixes**:
1. **Token expired** — regenerate npm token, update GitHub secret
2. **Token scope** — ensure token has `publish` permission
3. **2FA required** — use automation token (no 2FA prompt)
4. **Wrong registry** — check `.npmrc` for registry URL
