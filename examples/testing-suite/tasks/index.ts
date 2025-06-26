import { compileString } from 'cashc';
import fs from 'fs';
import { URL } from 'url';
import urlJoin from 'url-join';

interface CompilationCacheItem {
  mtime: number;
}

export const compile = (): void => {
  const cacheDirectory = new URL('../cache', import.meta.url);
  fs.mkdirSync(cacheDirectory, { recursive: true });
  const cacheFile = new URL('../cache/cashc.json', import.meta.url);
  let compilationCache: Record<string, CompilationCacheItem> = {};
  if (fs.existsSync(cacheFile)) {
    compilationCache = JSON.parse(fs.readFileSync(cacheFile, { encoding: 'utf-8' }));
  }

  const artifactsDirectory = new URL('../artifacts', import.meta.url);
  fs.mkdirSync(artifactsDirectory, { recursive: true });

  const contractsDirectory = new URL('../contracts', import.meta.url);
  const result = fs.readdirSync(contractsDirectory)
    .filter((fn) => fn.endsWith('.cash'))
    .map((fn) => ({ fn, contents: fs.readFileSync(new URL(urlJoin(contractsDirectory.toString(), fn)), { encoding: 'utf-8' }) }));

  result.forEach(({ fn, contents }) => {
    const mtime = fs.statSync(new URL(urlJoin(contractsDirectory.toString(), fn))).mtimeMs;
    if (!compilationCache[fn] || compilationCache[fn].mtime !== mtime) {
      console.log(`Compiling ${fn}...`);
      const artifact = compileString(contents);

      exportArtifact(artifact, new URL(`../artifacts/${fn.replace('.cash', '.artifact.ts')}`, import.meta.url));
      compilationCache[fn] = { mtime };
    }
  });

  // Write the updated cache back to the file
  fs.writeFileSync(cacheFile, JSON.stringify(compilationCache, null, 2), { encoding: 'utf-8' });
};

export const exportArtifact = (obj: object, outPath: string | URL): void => {
  const toTs = (value: any): string => {
    // First, stringify the object with indentation
    let json = JSON.stringify(value, null, 2);

    // Remove quotes from object keys where valid (simple JS identifiers)
    json = json.replace(
      /"([a-zA-Z_][a-zA-Z0-9_]*)":/g,
      '$1:'
    );

    return json;
  };

  const content = `export default ${toTs(obj)} as const;`;
  fs.writeFileSync(outPath, content, { encoding: 'utf-8' });
};

switch (process.argv[2]) {
  case 'compile':
    compile();
    break;
  default:
    console.log('Unknown task');
    break;
}
