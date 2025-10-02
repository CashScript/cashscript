import { fixtures } from '../fixture/libauth-template/fixtures.js';

describe('Libauth Template generation tests (single-contract)', () => {
  fixtures.forEach((fixture) => {
    it(`should generate a valid libauth template for ${fixture.name}`, () => {
      const generatedTemplate = fixture.transaction.getLibauthTemplate();
      // console.warn(JSON.stringify(generatedTemplate, null, 2));
      // console.warn(fixture.transaction.getBitauthUri());
      expect(generatedTemplate).toEqual(fixture.template);
    });
  });
});
