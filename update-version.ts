import { execSync } from 'child_process';
import fs from 'fs';
import { URL } from 'url';

// USAGE:
// $ yarn run update-version 'X.X.X'

const version = process.argv[2];
execSync(`yarn lerna version --no-push --no-git-tag-version --force-publish --yes ${version}`);

const indexFilePath = new URL('packages/cashc/src/index.ts', import.meta.url);
const data = fs.readFileSync(indexFilePath, 'utf8');
const updatedData = data.replace(/export const version = .*\n/, `export const version = '${version}';\n`);
fs.writeFileSync(indexFilePath, updatedData);
