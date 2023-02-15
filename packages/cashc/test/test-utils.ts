import fs from 'fs';
import { URL } from 'url';
import urlJoin from 'url-join';

export function getSubdirectories(directory: URL): string[] {
  return fs.readdirSync(directory)
    .filter((fn) => fs.statSync(new URL(urlJoin(directory.toString(), fn))).isDirectory());
}

export function readCashFiles(directory: URL): { fn: string, contents: string }[] {
  return fs.readdirSync(directory)
    .filter((fn) => fn.endsWith('.cash'))
    .map((fn) => ({ fn, contents: fs.readFileSync(new URL(urlJoin(directory.toString(), fn)), { encoding: 'utf-8' }) }));
}
