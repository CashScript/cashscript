const { exec } = require('child_process');
const fs = require('fs');

// USAGE:
// $ yarn run update-version 'X.X.X'

const version = process.argv[2];

[
  'packages/cashc',
  'packages/cashscript',
  'packages/utils',
].forEach((path) => exec(`npm --prefix ${path} version ${version}`));

const data = fs.readFileSync('packages/cashc/src/index.ts', 'utf8').split('\n');
data[0] = `export const version = '${version}'; // keep this on line 1`;
fs.writeFileSync('packages/cashc/src/index.ts', data.join('\n'));
