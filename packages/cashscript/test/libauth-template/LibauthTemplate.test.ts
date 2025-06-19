import { fixtures } from '../fixture/libauth-template/fixtures.js';
import { fixtures as oldFixtures } from '../fixture/libauth-template/old-fixtures.js';

describe('Libauth Template generation tests (single-contract)', () => {
  fixtures.forEach((fixture) => {
    it(`should generate a valid libauth template for ${fixture.name}`, () => {
      const generatedTemplate = fixture.transaction.getLibauthTemplate();
      // console.warn(JSON.stringify(generatedTemplate, null, 2));
      // console.warn(fixture.transaction.bitauthUri());
      expect(generatedTemplate).toEqual(fixture.template);
    });
  });
  // old-fixtures using the deprecated simple transaction builder
  oldFixtures.forEach((fixture) => {
    it(`should generate a valid libauth template for old-fixture ${fixture.name}`, async () => {
      const generatedTemplate = await fixture.transaction.getLibauthTemplate();
      // console.warn(JSON.stringify(generatedTemplate, null, 2));
      // console.warn(fixture.transaction.bitauthUri());
      expect(generatedTemplate).toEqual(fixture.template);
    });
  });
});
