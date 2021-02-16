import fs from 'fs';
import path from 'path';

export function getSubdirectories(directory: string): string[] {
  return fs.readdirSync(directory)
    .filter((fn) => fs.statSync(path.join(directory, fn)).isDirectory());
}

export function readCashFiles(directory: string): { fn: string, contents: string }[] {
  return fs.readdirSync(directory)
    .filter((fn) => fn.endsWith('.cash'))
    .map((fn) => ({ fn, contents: fs.readFileSync(path.join(directory, fn), { encoding: 'utf-8' }) }));
}
