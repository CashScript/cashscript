import fs from 'fs';
import { URL } from 'url';
import { Artifact } from '@cashscript/utils';
import { InternalCompilerOptions } from '../../src/internal.js';

export interface Fixture {
  compilerOptions?: InternalCompilerOptions;
  artifact: Omit<Artifact, 'source' | 'compiler' | 'updatedAt'>;
}

export interface FixtureModule {
  cashFile: string;
  fixtures: Fixture[];
}

export async function loadFixtureModules(): Promise<FixtureModule[]> {
  const modulePaths = fs.readdirSync(new URL('fixtures/', import.meta.url), { recursive: true, encoding: 'utf-8' })
    .map((entry) => entry.replaceAll('\\', '/'))
    .filter((entry) => entry.endsWith('.ts'));

  return Promise.all(modulePaths.map(async (modulePath) => {
    const imported = await import(`./fixtures/${modulePath.replace(/\.ts$/, '.js')}`);

    if (!Array.isArray(imported.fixtures)) {
      throw new Error(`Fixture module fixtures/${modulePath} must export a 'fixtures' array`);
    }

    return { cashFile: modulePath.replace(/\.ts$/, '.cash'), fixtures: imported.fixtures };
  }));
}
