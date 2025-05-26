import { compileString } from 'cashc';

const SAME_NAME_DIFFERENT_PATH = `
contract SameNameDifferentPath(int a) {
  function function_1(int b) {
    if (a == 0) {
      require(b == 0, "b should be 0");
    } else {
      require(b != 0, "b should not be 0");
    }
  }
}
`;

export const ARTIFACT_SAME_NAME_DIFFERENT_PATH = compileString(SAME_NAME_DIFFERENT_PATH);
