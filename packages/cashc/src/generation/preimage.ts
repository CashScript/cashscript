import { PreimageField } from '../ast/Globals';

type Part = {
  fromStart: number
  fromEnd: number
  size: number
}

export const PreimageParts: { [key in PreimageField]: Part } = {
  [PreimageField.VERSION]: {
    fromStart: 0,
    fromEnd: 0,
    size: 4,
  },
  [PreimageField.HASHPREVOUTS]: {
    fromStart: 4,
    fromEnd: 0,
    size: 32,
  },
  [PreimageField.HASHSEQUENCE]: {
    fromStart: 4 + 32,
    fromEnd: 0,
    size: 32,
  },
  [PreimageField.OUTPOINT]: {
    fromStart: 4 + 32 + 32,
    fromEnd: 0,
    size: 36,
  },
  [PreimageField.SCRIPTCODE]: {
    fromStart: 4 + 32 + 32 + 36,
    fromEnd: 0,
    size: 52,
  },
  [PreimageField.VALUE]: {
    fromStart: 0,
    fromEnd: 52,
    size: 8,
  },
  [PreimageField.SEQUENCE]: {
    fromStart: 8,
    fromEnd: 52 - 8,
    size: 4,
  },
  [PreimageField.HASHOUTPUTS]: {
    fromStart: 8 + 4,
    fromEnd: 52 - 8 - 4,
    size: 32,
  },
  [PreimageField.LOCKTIME]: {
    fromStart: 8 + 4 + 32,
    fromEnd: 52 - 8 - 4 - 32,
    size: 4,
  },
  [PreimageField.HASHTYPE]: {
    fromStart: 8 + 4 + 32 + 4,
    fromEnd: 52 - 8 - 4 - 32 - 4,
    size: 4,
  },
};
