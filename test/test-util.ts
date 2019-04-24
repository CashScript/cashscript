import * as fs from 'fs';
import * as path from 'path';

export function readCashFiles(directory: string): {fn: string, contents: string}[] {
    return fs.readdirSync(directory)
        .filter(fn => fn.endsWith('.cash'))
        .map(fn => {
            return { fn, contents: fs.readFileSync(path.join(directory, fn), { encoding: 'utf-8' }) }
        });
}
