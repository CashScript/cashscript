import { compileString } from 'cashc';
import fs from 'fs';
import { URL } from 'url';
import urlJoin from 'url-join';

export const compile = (): void => {
  const directory = new URL('../contracts', import.meta.url);
  const result = fs.readdirSync(directory)
    .filter((fn) => fn.endsWith('.cash'))
    .map((fn) => ({ fn, contents: fs.readFileSync(new URL(urlJoin(directory.toString(), fn)), { encoding: 'utf-8' }) }));

  result.forEach(({ fn, contents }) => {
    const artifact = compileString(contents);

    fs.writeFileSync(new URL(`../artifacts/${fn.replace('.cash', '.json')}`, import.meta.url), JSON.stringify(artifact, null, 2));
  });
};

switch (process.argv[2]) {
  case 'compile':
    compile();
    break;
  default:
    console.log('Unknown task');
    break;
}
