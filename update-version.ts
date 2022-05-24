import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// USAGE:
// $ yarn run update-version 'X.X.X'

const version = process.argv[2];
execSync(`yarn lerna version --no-push --no-git-tag-version --force-publish --yes ${version}`);

const indexFilePath = path.join(__dirname, 'packages', 'cashc', 'src', 'index.ts');
const data = fs.readFileSync(indexFilePath, 'utf8');
const updatedData = data.replace(/export const version = .*\n/, `export const version = '${version}';\n`);
fs.writeFileSync(indexFilePath, updatedData);
