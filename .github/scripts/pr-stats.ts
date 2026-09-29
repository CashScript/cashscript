// Breaks a pull request's changed lines down by package and by kind of change (source, tests, docs,
// dependencies, ...), so reviewers can see at a glance how big a change is and where it lands.
//
// Usage: node .github/scripts/pr-stats.ts <base-revision> <head-revision>
//
// The script has no dependencies and only reads git history, so it is safe to run against untrusted
// pull request revisions. Node runs the TypeScript directly (type stripping, Node 22.18+).

import { execFileSync } from 'node:child_process';

type Area = 'compiler' | 'sdk' | 'utils' | 'website' | 'examples' | 'repository';
type Kind = 'source' | 'tests' | 'docs' | 'dependencies' | 'config' | 'version' | 'generated';

interface FileChange {
  filePath: string;
  area: Area;
  kind: Kind;
  added: number;
  removed: number;
}

interface Churn {
  added: number;
  removed: number;
}

const areaRules: { area: Area; prefix: string }[] = [
  { area: 'compiler', prefix: 'packages/cashc/' },
  { area: 'sdk', prefix: 'packages/cashscript/' },
  { area: 'utils', prefix: 'packages/utils/' },
  { area: 'website', prefix: 'website/' },
  { area: 'examples', prefix: 'examples/' },
];

// Order matters: the first matching rule wins, anything unmatched is source.
const kindRules: { kind: Kind; matches: (filePath: string) => boolean }[] = [
  {
    kind: 'generated',
    matches: (filePath) => baseName(filePath) === 'yarn.lock' || isGeneratedGrammar(filePath),
  },
  { kind: 'dependencies', matches: (filePath) => baseName(filePath) === 'package.json' },
  { kind: 'tests', matches: (filePath) => filePath.includes('/test/') || filePath.endsWith('.test.ts') },
  // Agent instructions are tooling configuration rather than documentation for readers, despite being markdown.
  {
    kind: 'config',
    matches: (filePath) => filePath.startsWith('.github/')
      || baseName(filePath).startsWith('.')
      || /^(tsconfig.*\.json|vitest\.(config|setup)\.ts|lerna\.json|docusaurus\.config\.ts|sidebars\.ts)$/
        .test(baseName(filePath))
      || ['AGENTS.md', 'CLAUDE.md'].includes(baseName(filePath)),
  },
  {
    kind: 'docs',
    matches: (filePath) => /\.mdx?$/.test(filePath) || /^website\/(docs|static)\//.test(filePath),
  },
];

const areaLabels: Record<Area, string> = {
  compiler: 'Compiler (`cashc`)',
  sdk: 'SDK (`cashscript`)',
  utils: 'Utils (`@cashscript/utils`)',
  website: 'Website',
  examples: 'Examples',
  repository: 'Repository',
};

const kindLabels: Record<Kind, string> = {
  source: 'Source',
  tests: 'Tests',
  docs: 'Docs',
  dependencies: 'Deps',
  config: 'Config',
  version: 'Version',
  generated: 'Generated',
};

const areaOrder: Area[] = ['compiler', 'sdk', 'utils', 'website', 'examples', 'repository'];
const kindOrder: Kind[] = ['source', 'tests', 'docs', 'dependencies', 'config', 'version', 'generated'];

// Version bumps and generated files are left out of the totals: there is nothing in them to review, and a
// lock file update would otherwise dwarf everything else.
const excludedFromTotal: Kind[] = ['version', 'generated'];

// Workspace packages are bumped together on every release. Their version lines count as version bumps
// rather than dependency changes, and are summarised once instead of listed per package.json.
const workspacePackages = ['cashc', 'cashscript', '@cashscript/utils'];
const versionConstantPath = 'packages/cashc/src/index.ts';

const releaseNotesPath = 'website/docs/releases/release-notes.md';
const publishedAreas: Area[] = ['compiler', 'sdk', 'utils'];
const listedNewFiles = 10;

const [baseRevision, headRevision] = requireRevisions();
// Diffing against the merge base keeps commits that landed on the base branch after the pull request
// was opened out of the numbers.
const mergeBase = git(['merge-base', baseRevision, headRevision]).trim();

const lineCounts = git(['diff', '--numstat', '--no-renames', mergeBase, headRevision]);
console.log(renderReport(parseLineCounts(lineCounts).flatMap(splitVersionLines)));

function renderReport(changes: FileChange[]): string {
  if (changes.length === 0) return 'No line changes in this pull request.';

  return [
    '### Pull request stats',
    '',
    ...renderTable(changes),
    '',
    ...renderSummary(changes),
    ...renderVersionBump(changes),
    ...renderDependencyChanges(changes),
    ...renderNewFiles(),
    ...renderReleaseNotesReminder(changes),
  ].join('\n');
}

function renderTable(changes: FileChange[]): string[] {
  const areas = areaOrder.filter((area) => changes.some((change) => change.area === area));
  const kinds = kindOrder.filter((kind) => changes.some((change) => change.kind === kind));
  const reviewableChurn = churnOf(reviewable(changes));

  const header = `| | ${kinds.map((kind) => kindLabels[kind]).join(' | ')} | Total | Net | Share |`;
  const separator = `|---|${kinds.map(() => '---:|').join('')}---:|---:|---:|`;
  const rows = areas.map((area) => {
    const inArea = changes.filter((change) => change.area === area);
    return renderRow(areaLabels[area], inArea, kinds, reviewableChurn);
  });
  const totalRow = renderRow('**Total**', changes, kinds, reviewableChurn);

  return [header, separator, ...rows, totalRow];
}

function renderRow(label: string, changes: FileChange[], kinds: Kind[], reviewableChurn: Churn): string {
  const cells = kinds.map((kind) => formatChurn(churnOf(changes.filter((change) => change.kind === kind))));
  const total = churnOf(reviewable(changes));
  const share = sizeOf(reviewableChurn) === 0 ? '—' : formatPercentage(sizeOf(total) / sizeOf(reviewableChurn));
  return `| ${label} | ${cells.join(' | ')} | ${formatChurn(total)} | ${formatNet(total)} | ${share} |`;
}

function renderSummary(changes: FileChange[]): string[] {
  const reviewableChurn = churnOf(reviewable(changes));
  const net = sizeOf(reviewableChurn) === 0 ? '' : ` (net ${formatNet(reviewableChurn)})`;
  const lines = [
    `Reviewable churn: ${sizeOf(reviewableChurn)} lines${net}, version bumps and generated files excluded.`,
  ];

  const sourceChurn = sizeOf(churnOf(changes.filter((change) => change.kind === 'source')));
  const testChurn = sizeOf(churnOf(changes.filter((change) => change.kind === 'tests')));
  if (sourceChurn > 0) lines.push(`Test lines per line of source: ${(testChurn / sourceChurn).toFixed(2)}.`);

  // Only source files are read line by line, which keeps lock files and fixtures out of the comment share.
  const addedSourceLines = changes
    .filter((change) => change.kind === 'source')
    .flatMap((change) => addedLinesOf(change.filePath))
    .filter((line) => !isVersionLine(line));
  const comments = addedSourceLines.filter(isComment).length;
  const nonBlank = addedSourceLines.filter((line) => line.trim() !== '').length;
  if (nonBlank > 0) {
    lines.push(`Comments: ${comments} of ${nonBlank} added source lines, ${formatPercentage(comments / nonBlank)}.`);
  }

  return lines;
}

// A release bumps every package.json at once, which reads best as one line rather than one per file.
function renderVersionBump(changes: FileChange[]): string[] {
  const bumps = new Map<string, string[]>();

  for (const change of changes.filter((entry) => entry.kind === 'version' && baseName(entry.filePath) === 'package.json')) {
    const before = packageManifest(fileAt(mergeBase, change.filePath));
    const after = packageManifest(fileAt(headRevision, change.filePath));
    if (!before.version || !after.version || before.version === after.version) continue;

    const bump = `${before.version} → ${after.version}`;
    bumps.set(bump, [...(bumps.get(bump) ?? []), `\`${after.name ?? change.filePath}\``]);
  }

  return [...bumps].map(([bump, packages]) => `Version bump: ${bump} in ${packages.join(', ')}.`);
}

// Which packages the pull request brings in or drops, as opposed to how many lines of package.json moved.
// A new dependency is the part that warrants a look of its own.
function renderDependencyChanges(changes: FileChange[]): string[] {
  const lines: string[] = [];

  for (const change of changes.filter((entry) => entry.kind === 'dependencies')) {
    const before = declaredDependencies(fileAt(mergeBase, change.filePath));
    const after = declaredDependencies(fileAt(headRevision, change.filePath));
    const added = Object.entries(after)
      .filter(([name]) => !(name in before))
      .map(([name, version]) => `\`${name}@${version}\``);
    const removed = Object.keys(before).filter((name) => !(name in after)).map((name) => `\`${name}\``);
    const updated = Object.entries(after)
      .filter(([name, version]) => name in before && before[name] !== version && !workspacePackages.includes(name))
      .map(([name, version]) => `\`${name}\` ${before[name]} → ${version}`);

    if (added.length > 0) lines.push(`- \`${change.filePath}\` adds ${added.join(', ')}`);
    if (removed.length > 0) lines.push(`- \`${change.filePath}\` removes ${removed.join(', ')}`);
    if (updated.length > 0) lines.push(`- \`${change.filePath}\` updates ${updated.join(', ')}`);
  }

  return lines.length === 0 ? [] : ['', 'Dependency changes:', ...lines];
}

// Files added by this pull request say how much of it is new surface rather than edits to code that
// already had reviewers.
function renderNewFiles(): string[] {
  const newFiles = git(['diff', '--name-status', '--no-renames', mergeBase, headRevision])
    .split('\n')
    .filter((line) => line.startsWith('A\t'))
    .map((line) => line.slice(2))
    .filter((filePath) => kindOf(filePath) !== 'generated');
  if (newFiles.length === 0) return [];

  const shown = newFiles.slice(0, listedNewFiles).map((filePath) => `- \`${filePath}\``);
  const hidden = newFiles.length > listedNewFiles ? [`- and ${newFiles.length - listedNewFiles} more`] : [];
  return ['', `New files: ${newFiles.length}`, ...shown, ...hidden];
}

// Source changes to a published package usually deserve a line in the release notes.
function renderReleaseNotesReminder(changes: FileChange[]): string[] {
  const changesPublishedSource = changes
    .some((change) => change.kind === 'source' && publishedAreas.includes(change.area));
  const touchesReleaseNotes = changes.some((change) => change.filePath === releaseNotesPath);
  if (!changesPublishedSource || touchesReleaseNotes) return [];

  return ['', `Package source changed without an update to \`${releaseNotesPath}\`.`];
}

function requireRevisions(): [string, string] {
  const [base, head] = process.argv.slice(2);
  if (!base || !head) {
    console.error('Usage: node .github/scripts/pr-stats.ts <base-revision> <head-revision>');
    process.exit(1);
  }
  return [base, head];
}

// Version lines in files that hold a version are split off from the rest of the file's changes, so a release
// bump does not read as dependency or source changes.
function splitVersionLines(change: FileChange): FileChange[] {
  if (!isVersionedFile(change.filePath)) return [change];

  const changedLines = changedLinesOf(change.filePath);
  const versionLines = changedLines.filter((line) => isVersionLine(line.slice(1)));
  const otherLines = changedLines.filter((line) => !isVersionLine(line.slice(1)));

  return [
    { ...change, kind: 'version' as Kind, ...countLines(versionLines) },
    { ...change, ...countLines(otherLines) },
  ].filter((entry) => sizeOf(entry) > 0);
}

function isVersionedFile(filePath: string): boolean {
  return ['package.json', 'lerna.json'].includes(baseName(filePath)) || filePath === versionConstantPath;
}

// A package's own version, a workspace package's version in a dependency list, or the compiler's version constant.
function isVersionLine(line: string): boolean {
  const workspaceDependency = workspacePackages.some((name) => line.trim().startsWith(`"${name}":`));
  return /^\s*"version":/.test(line) || /^export const version = /.test(line) || workspaceDependency;
}

function countLines(changedLines: string[]): Churn {
  return {
    added: changedLines.filter((line) => line.startsWith('+')).length,
    removed: changedLines.filter((line) => line.startsWith('-')).length,
  };
}

// Parses the output of `git diff --numstat`, one "<added>\t<removed>\t<path>" line per file.
// Binary files report "-" for both counts and are left out.
function parseLineCounts(lineCounts: string): FileChange[] {
  return lineCounts
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const [added, removed, filePath] = line.split('\t');
      return { filePath, area: areaOf(filePath), kind: kindOf(filePath), added: Number(added), removed: Number(removed) };
    })
    .filter((change) => Number.isInteger(change.added) && Number.isInteger(change.removed));
}

function areaOf(filePath: string): Area {
  return areaRules.find((rule) => filePath.startsWith(rule.prefix))?.area ?? 'repository';
}

function kindOf(filePath: string): Kind {
  return kindRules.find((rule) => rule.matches(filePath))?.kind ?? 'source';
}

// The ANTLR output next to the grammar is regenerated with `yarn antlr`, only the .g4 file is written by hand.
function isGeneratedGrammar(filePath: string): boolean {
  return filePath.startsWith('packages/cashc/src/grammar/') && !filePath.endsWith('.g4');
}

function baseName(filePath: string): string {
  return filePath.slice(filePath.lastIndexOf('/') + 1);
}

function reviewable(changes: FileChange[]): FileChange[] {
  return changes.filter((change) => !excludedFromTotal.includes(change.kind));
}

function churnOf(changes: FileChange[]): Churn {
  return {
    added: changes.reduce((sum, change) => sum + change.added, 0),
    removed: changes.reduce((sum, change) => sum + change.removed, 0),
  };
}

function sizeOf(churn: Churn): number {
  return churn.added + churn.removed;
}

function formatChurn(churn: Churn): string {
  return sizeOf(churn) === 0 ? '' : `+${churn.added} −${churn.removed}`;
}

function formatNet(churn: Churn): string {
  const net = churn.added - churn.removed;
  if (sizeOf(churn) === 0) return '';
  if (net === 0) return '±0';
  return net > 0 ? `+${net}` : `−${-net}`;
}

function formatPercentage(fraction: number): string {
  if (fraction > 0 && fraction < 0.01) return '<1%';
  return `${Math.round(fraction * 100)}%`;
}

// Lines carrying nothing but a comment, in both TypeScript and CashScript: the line form, and the opening,
// body and closing of the block form, which this codebase writes with a leading asterisk.
function isComment(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

function addedLinesOf(filePath: string): string[] {
  return changedLinesOf(filePath).filter((line) => line.startsWith('+')).map((line) => line.slice(1));
}

// The added and removed lines of a file, each still carrying its "+" or "-" prefix. Without context lines,
// everything after the file header is a hunk header or a changed line.
function changedLinesOf(filePath: string): string[] {
  const diffLines = git(['diff', '-U0', '--no-renames', mergeBase, headRevision, '--', filePath]).split('\n');
  const firstHunk = diffLines.findIndex((line) => line.startsWith('@@'));
  return firstHunk === -1 ? [] : diffLines.slice(firstHunk).filter((line) => /^[+-]/.test(line));
}

interface PackageManifest {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function declaredDependencies(content: string): Record<string, string> {
  const manifest = packageManifest(content);
  return { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies };
}

// Returns an empty manifest for a missing or invalid package.json.
function packageManifest(content: string): PackageManifest {
  if (content === '') return {};
  try {
    return JSON.parse(content) as PackageManifest;
  } catch {
    return {};
  }
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// Returns an empty string when the file does not exist at that revision, which is the case on either side
// of an addition or a deletion. Git reports that on stderr, which is silenced so it does not read as a failure.
function fileAt(revision: string, filePath: string): string {
  try {
    return execFileSync('git', ['show', `${revision}:${filePath}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}
