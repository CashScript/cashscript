import { formatArtifact } from '@cashscript/utils';
import { compileString } from 'cashc';
import fs from 'fs';
import { URL } from 'url';

export const compile = (): void => {
  const directory = new URL('../contracts', import.meta.url);
  const result = fs.readdirSync(directory)
    .filter((fn) => fn.endsWith('.cash'));

  fs.mkdirSync(new URL('../artifacts', import.meta.url), { recursive: true });

  result.forEach((fn) => {
    const contractFile = new URL(fn, `${directory}/`);
    const jsonOutputFile = new URL(`../artifacts/${fn.replace('.cash', '.json')}`, import.meta.url);
    const tsOutputFile = new URL(`../artifacts/${fn.replace('.cash', '.artifact.ts')}`, import.meta.url);

    try {
      const contents = fs.readFileSync(contractFile, { encoding: 'utf-8' });
      const artifact = compileString(contents);

      fs.writeFileSync(jsonOutputFile, formatArtifact(artifact, 'json'));
      fs.writeFileSync(tsOutputFile, formatArtifact(artifact, 'ts'));
    } catch (error: any) {
      console.error(`Error compiling ${fn}: ${error.message}`);
      return;
    }

    console.log(`Successfully compiled ${fn}`);
  });
};

compile();
