import { LocationData } from '../../src/source-map.js';

export interface Fixture {
  name: string;
  locationData: LocationData;
  sourceMap: string;
}

export const fixtures: Fixture[] = [
  {
    name: 'Basic Test',
    locationData: [
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } } ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } } ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } } ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } } ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } } ],
      [{ start: { line: 11, column: 26 }, end: { line: 11, column: 32 } } ],
      [{ start: { line: 13, column: 20 }, end: { line: 13, column: 24 } } ],
      [{ start: { line: 13, column: 20 }, end: { line: 13, column: 24 } } ],
      [{ start: { line: 13, column: 28 }, end: { line: 13, column: 34 } } ],
      [{ start: { line: 13, column: 20 }, end: { line: 13, column: 34 } }, 1 ],
      [{ start: { line: 13, column: 20 }, end: { line: 13, column: 34 } }, 1 ],
      [{ start: { line: 13, column: 12 }, end: { line: 13, column: 36 } }, 1 ],
      [{ start: { line: 14, column: 29 }, end: { line: 14, column: 41 } } ],
      [{ start: { line: 14, column: 29 }, end: { line: 14, column: 41 } } ],
      [{ start: { line: 14, column: 43 }, end: { line: 14, column: 52 } } ],
      [{ start: { line: 14, column: 43 }, end: { line: 14, column: 52 } } ],
      [{ start: { line: 14, column: 20 }, end: { line: 14, column: 53 } }, 1 ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } }, 1 ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } }, 1 ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } }, 1 ],
      [{ start: { line: 10, column: 8 }, end: { line: 15, column: 9 } }, 1 ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } } ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } } ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } } ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } } ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } } ],
      [{ start: { line: 19, column: 29 }, end: { line: 19, column: 38 } } ],
      [{ start: { line: 19, column: 29 }, end: { line: 19, column: 38 } } ],
      [{ start: { line: 19, column: 40 }, end: { line: 19, column: 46 } } ],
      [{ start: { line: 19, column: 40 }, end: { line: 19, column: 46 } } ],
      [{ start: { line: 19, column: 20 }, end: { line: 19, column: 47 } }, 1 ],
      [{ start: { line: 19, column: 12 }, end: { line: 19, column: 49 } }, 1 ],
      [{ start: { line: 20, column: 31 }, end: { line: 20, column: 38 } } ],
      [{ start: { line: 20, column: 31 }, end: { line: 20, column: 38 } } ],
      [{ start: { line: 20, column: 12 }, end: { line: 20, column: 40 } }, 1 ],
      [{ start: { line: 20, column: 12 }, end: { line: 20, column: 40 } }, 1 ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } }, 1 ],
      [{ start: { line: 18, column: 8 }, end: { line: 21, column: 9 } }, 1 ],
      [{ start: { line: 4, column: 4 }, end: { line: 22, column: 5 } }, 1 ],
    ],
    sourceMap: '10:8:15:9;;;;;11:26:11:32;13:20:13:24;;:28::34;:20:::1;;:12::36;14:29:14:41:0;;:43::52;;:20::53:1;10:8:15:9;;;;18::21::0;;;;;19:29:19:38;;:40::46;;:20::47:1;:12::49;20:31:20:38:0;;:12::40:1;;18:8:21:9;;4:4:22:5',
  },
];
