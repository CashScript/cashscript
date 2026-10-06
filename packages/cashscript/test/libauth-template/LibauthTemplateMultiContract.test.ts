import { fixtures } from '../fixture/libauth-template/multi-contract-fixtures.js';
import { expectSameDebugOutcomeWithTransactionBytecode } from '../test-util.js';

describe('Libauth Template generation tests (multi-contract)', () => {
  it.each(fixtures)('should generate a valid libauth template for $name', async (fixture) => {
    const builder = await fixture.transaction;
    const generatedTemplate = builder.getLibauthTemplate();
    // console.warn(JSON.stringify(generatedTemplate, null, 2));
    // console.warn(builder.bitauthUri());
    expect(generatedTemplate).toEqual(fixture.template);
  });

  it.each(fixtures)('should give the same debug outcome when using transaction bytecode for $name', async (fixture) => {
    expectSameDebugOutcomeWithTransactionBytecode(await fixture.transaction);
  });
});
