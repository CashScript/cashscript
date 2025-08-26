import { fixtures } from '../fixture/libauth-template/fixtures.js';
import { fixtures as oldFixtures } from '../fixture/libauth-template/old-fixtures.js';
import { describe, expect, it } from 'vitest';

describe('Libauth Template generation tests (single-contract)', () => {
  it.each(fixtures)('should generate a valid libauth template for $name', (fixture) => {
    const generatedTemplate = fixture.transaction.getLibauthTemplate();
    // console.warn(JSON.stringify(generatedTemplate, null, 2));
    // console.warn(fixture.transaction.bitauthUri());
    expect(generatedTemplate).toEqual(fixture.template);
  });
  // old-fixtures using the deprecated simple transaction builder
  it.each(oldFixtures)('should generate a valid libauth template for old-fixture $name', async (fixture) => {
    const generatedTemplate = await fixture.transaction.getLibauthTemplate();
    // console.warn(JSON.stringify(generatedTemplate, null, 2));
    // console.warn(fixture.transaction.bitauthUri());
    expect(generatedTemplate).toEqual(fixture.template);
  });
});
