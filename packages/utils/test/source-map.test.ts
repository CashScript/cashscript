import { generateSourceMap, sourceMapToLocationData } from '../src/index.js';
import { fixtures } from './fixtures/source-map.fixture.js';
import { describe, it, expect } from 'vitest';

describe('Source map generation', () => {
  fixtures.forEach((fixture) => {
    describe(fixture.name, () => {
      it('should map from location data to source map', () => {
        const sourceMap = generateSourceMap(fixture.locationData);
        expect(sourceMap).toBe(fixture.sourceMap);
      });

      it('should map from source map to location data', () => {
        const locationData = sourceMapToLocationData(fixture.sourceMap);
        expect(locationData).toEqual(fixture.locationData);
      });
    });
  });
});
