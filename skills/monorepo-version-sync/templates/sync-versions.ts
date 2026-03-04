/**
 * sync-versions.ts — Propagate root package.json version to all workspace packages and Cargo.toml.
 *
 * Usage:
 *   pnpm tsx scripts/sync-versions.ts
 *   pnpm tsx scripts/sync-versions.ts --version 0.2.16-dev.12345678
 *
 * CUSTOMIZE: Update the package discovery paths and Cargo.toml location
 * to match your project structure.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { globSync } from 'glob';

// CUSTOMIZE: Path to root package.json
const ROOT = resolve(import.meta.dirname, '..');
const rootPkgPath = join(ROOT, 'package.json');

// CUSTOMIZE: Path to Cargo.toml (or Cargo workspace root)
const cargoPath = join(ROOT, 'Cargo.toml');

// CUSTOMIZE: Glob patterns for workspace packages
const workspaceGlobs = ['packages/*/package.json'];

function main() {
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));

  // Allow version override via CLI arg
  const versionOverride = process.argv.find((a) => a.startsWith('--version='))?.split('=')[1]
    ?? (process.argv.includes('--version') ? process.argv[process.argv.indexOf('--version') + 1] : undefined);

  const version = versionOverride ?? rootPkg.version;
  console.log(`📦 Syncing version: ${version}`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Sync workspace packages
  for (const pattern of workspaceGlobs) {
    const matches = globSync(join(ROOT, pattern));
    for (const pkgPath of matches) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        if (pkg.version === version) {
          console.log(`  ⏭️  ${pkg.name}: already at ${version}`);
          skipped++;
          continue;
        }
        pkg.version = version;
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        console.log(`  ✅ ${pkg.name}: → ${version}`);
        updated++;
      } catch (err) {
        console.error(`  ❌ ${pkgPath}: ${err}`);
        errors++;
      }
    }
  }

  // Sync Cargo.toml
  if (existsSync(cargoPath)) {
    try {
      const cargo = readFileSync(cargoPath, 'utf8');
      // Only use base version for Cargo (strip pre-release suffix)
      const cargoVersion = version.replace(/-.*$/, '');
      const updatedCargo = cargo.replace(
        /^version\s*=\s*"[^"]*"/m,
        `version = "${cargoVersion}"`
      );
      if (cargo !== updatedCargo) {
        writeFileSync(cargoPath, updatedCargo);
        console.log(`  ✅ Cargo.toml: → ${cargoVersion}`);
        updated++;
      } else {
        console.log(`  ⏭️  Cargo.toml: already at ${cargoVersion}`);
        skipped++;
      }
    } catch (err) {
      console.error(`  ❌ Cargo.toml: ${err}`);
      errors++;
    }
  }

  console.log(`\n📊 Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
  if (errors > 0) process.exit(1);
}

main();
