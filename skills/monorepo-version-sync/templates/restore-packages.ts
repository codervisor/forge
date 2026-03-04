/**
 * restore-packages.ts — Restore workspace:* dependencies after publishing.
 *
 * Finds .backup files created by prepare-publish.ts and restores originals.
 *
 * Usage:
 *   pnpm tsx scripts/restore-packages.ts
 *
 * CUSTOMIZE: Update the search paths to match your project structure.
 */

import { copyFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { globSync } from 'glob';

const ROOT = resolve(import.meta.dirname, '..');

// CUSTOMIZE: Glob patterns for backup files
const backupGlobs = ['packages/*/package.json.backup'];

function main() {
  console.log('🔄 Restoring package.json files from backups...');

  let restored = 0;

  for (const pattern of backupGlobs) {
    const matches = globSync(`${ROOT}/${pattern}`);
    for (const backupPath of matches) {
      const originalPath = backupPath.replace('.backup', '');
      copyFileSync(backupPath, originalPath);
      unlinkSync(backupPath);
      console.log(`  ✅ Restored: ${originalPath}`);
      restored++;
    }
  }

  if (restored === 0) {
    console.log('  ⏭️  No backup files found');
  } else {
    console.log(`\n📊 Restored ${restored} file(s)`);
  }
}

main();
