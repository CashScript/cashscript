import { fixtures } from '../fixture/libauth-template/fixtures.js';

describe('Libauth Template generation tests', () => {
  fixtures.forEach((fixture) => {
    it(`should generate a valid libauth template for ${fixture.name}`, async () => {
      const generatedTemplate = await fixture.transaction.getLibauthTemplate();
      console.log(JSON.stringify(generatedTemplate, null, 2));
      console.log(await fixture.transaction.bitauthUri());
      expect(generatedTemplate).toEqual(fixture.template);
    });
  });
});
