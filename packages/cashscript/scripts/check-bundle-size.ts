#!/usr/bin/env tsx
// Bundles the built package plus its runtime dependencies through Vite/Rollup and
// checks the gzipped size against bundle-size.budget.json to catch regressions (#389).
// Also emits a dependency treemap at bundle-size/stats.html.
// Run `yarn size` to check, or `yarn size --update` to rewrite the budget.

import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { gzipSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

interface SizeResult {
  minified: number;
  gzip: number;
}

interface Budget {
  tolerance?: number;
  scenarios?: Record<string, { maxGzip: number }>;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(scriptDir, '..');
const workDir = join(pkgDir, 'bundle-size');
const budgetFile = join(pkgDir, 'bundle-size.budget.json');

// `full` references the whole namespace so nothing tree-shakes (like bundlephobia).
// `typical` is a realistic app that builds and sends a transaction.
const scenarios: Record<string, string> = {
  full: `import * as cashscript from '../dist/index.js';
globalThis.__keepAlive = cashscript;`,
  typical: `import { Contract, TransactionBuilder, ElectrumNetworkProvider, SignatureTemplate } from '../dist/index.js';
console.log(Contract, TransactionBuilder, ElectrumNetworkProvider, SignatureTemplate);`,
};

// Build in app mode (not lib mode) so Vite bundles every dependency instead of
// externalizing them.
async function measure(name: string, contents: string): Promise<SizeResult> {
  const entryFile = join(workDir, `entry-${name}.js`);
  const outDir = join(workDir, `out-${name}`);
  writeFileSync(entryFile, contents);

  await build({
    configFile: false,
    logLevel: 'silent',
    root: workDir,
    build: {
      outDir,
      emptyOutDir: true,
      target: 'esnext', // libauth instantiates its wasm crypto via top-level await
      minify: 'esbuild',
      modulePreload: false,
      reportCompressedSize: false,
      rollupOptions: {
        input: entryFile,
        output: { entryFileNames: 'bundle.js', format: 'es' },
        plugins: name === 'full'
          ? [visualizer({ filename: join(workDir, 'stats.html'), gzipSize: true, brotliSize: true })]
          : [],
      },
    },
  });

  const code = readFileSync(join(outDir, 'bundle.js'));
  return { minified: code.length, gzip: gzipSync(code, { level: 9 }).length };
}

const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} kB`;

mkdirSync(workDir, { recursive: true });

const update = process.argv.includes('--update');
const budget: Budget = update ? {} : JSON.parse(readFileSync(budgetFile, 'utf8'));

const measured: Record<string, SizeResult> = {};
for (const [name, contents] of Object.entries(scenarios)) {
  measured[name] = await measure(name, contents);
}

// Clean up the transient build outputs, keeping the treemap.
for (const name of Object.keys(scenarios)) {
  rmSync(join(workDir, `out-${name}`), { recursive: true, force: true });
  rmSync(join(workDir, `entry-${name}.js`), { force: true });
}

if (update) {
  const next = {
    _comment: 'Gzipped-byte budgets for the cashscript consumer bundle. Regenerate with `yarn size --update`. See issue #389.',
    tolerance: 0.05,
    scenarios: Object.fromEntries(
      Object.entries(measured).map(([name, m]) => [name, { maxGzip: m.gzip }]),
    ),
  };
  writeFileSync(budgetFile, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Updated ${budgetFile}`);
  for (const [name, m] of Object.entries(measured)) {
    console.log(`  ${name.padEnd(8)} ${kb(m.gzip)} gzip (${kb(m.minified)} min)`);
  }
  process.exit(0);
}

const tolerance = budget.tolerance ?? 0.05;
let failed = false;

console.log(`Bundle size check (budget tolerance +${(tolerance * 100).toFixed(0)}%)\n`);
console.log('scenario   gzip        min         budget      status');
for (const [name, m] of Object.entries(measured)) {
  const max = budget.scenarios?.[name]?.maxGzip;
  if (max == null) {
    console.log(`${name.padEnd(10)} ${kb(m.gzip).padEnd(11)} ${kb(m.minified).padEnd(11)} (no budget) MISSING`);
    failed = true;
    continue;
  }
  const limit = max * (1 + tolerance);
  const ok = m.gzip <= limit;
  failed = failed || !ok;
  console.log(`${name.padEnd(10)} ${kb(m.gzip).padEnd(11)} ${kb(m.minified).padEnd(11)} ${kb(max).padEnd(11)} ${ok ? 'ok' : 'OVER BUDGET'}`);
}

if (failed) {
  console.error('\nBundle size exceeded budget. If this is intentional, run `yarn size --update` and commit the new budget.');
  process.exit(1);
}
console.log('\nAll scenarios within budget.');
