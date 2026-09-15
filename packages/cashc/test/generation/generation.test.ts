import fs from 'fs';
import { URL } from 'url';
import { CompilerOptions } from '@cashscript/utils';
import { compileFile, DEFAULT_COMPILER_OPTIONS, InternalCompilerOptions } from '../../src/internal.js';
import { version } from '../../src/index.js';
import { loadFixtureModules } from './fixture-utils.js';

const fixtureModules = await loadFixtureModules();

describe('Code generation & target code optimisation', () => {
  it('should have a fixture module for every valid contract file', () => {
    const cashFiles = fs.readdirSync(new URL('../valid-contract-files', import.meta.url))
      .filter((fn) => fn.endsWith('.cash'))
      .map((fn) => `valid-contract-files/${fn}`);

    const coveredCashFiles = fixtureModules
      .map((fixtureModule) => fixtureModule.cashFile)
      .filter((fn) => fn.startsWith('valid-contract-files/'));

    expect(coveredCashFiles.sort()).toEqual(cashFiles.sort());
  });

  fixtureModules.forEach(({ cashFile, fixtures }) => {
    fixtures.forEach((fixture) => {
      const variant = fixture.compilerOptions ? ` (${JSON.stringify(fixture.compilerOptions)})` : '';
      it(`should compile ${cashFile} to correct Script and artifact${variant}`, () => {
        const sourceFile = new URL(`../${cashFile}`, import.meta.url);
        const artifact = compileFile(sourceFile, fixture.compilerOptions);

        expect(artifact).toEqual({
          ...fixture.artifact,
          source: fs.readFileSync(sourceFile, { encoding: 'utf-8' }),
          compiler: { name: 'cashc', version, options: artifactCompilerOptions(fixture.compilerOptions) },
          updatedAt: expect.any(String),
        });
      });
    });
  });
});

// The artifact records the merged public compiler options (internal-only options are stripped)
function artifactCompilerOptions(compilerOptions: InternalCompilerOptions = {}): CompilerOptions {
  const mergedOptions: InternalCompilerOptions = { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptions };
  delete mergedOptions.disableInlining;
  return mergedOptions;
}
