import { compileString } from 'cashc';

const SAME_NAME_DIFFERENT_PATH = `
contract SameNameDifferentPath(int a) {
  function function_1(int b) {
    if (a == 0) {
      console.log("a is 0");
      require(b == 0, "b should be 0");
    } else {
      console.log("a is not 0");
      require(b != 0, "b should not be 0");
    }
  }
}
`;

const NAME_COLLISION = `
contract NameCollision(int a) {
  function name_collision(int b) {
    require(a == 0, "a should be 0");
    require(b == 0, "b should be 0");
  }
}
`;

const CONTRACT_NAME_COLLISION = `
contract NameCollision(int a) {
  function name_collision(int b) {
    require(b == 1, "b should be 1");
    require(a == 1, "a should be 1");
  }
}
`;

const FUNCTION_NAME_COLLISION = `
contract FunctionNameCollision(int a) {
  function name_collision(int b) {
    require(b == 1, "b should be 1");
    require(a == 1, "a should be 1");
  }
}
`;

// Two contracts where the name of one is a prefix of the name of the other
const PREFIX_NAME = `
contract Vault(int a) {
  function spend(int b) {
    console.log("vault b is", b);
    require(a == b, "b should be a");
  }
}
`;

const PREFIXED_NAME = `
contract VaultSidecar() {
  function spend(int c, int d) {
    require(c + d == 10, "c + d should be 10");
    require(c > d, "c should be larger than d");
  }
}
`;

export const ARTIFACT_SAME_NAME_DIFFERENT_PATH = compileString(SAME_NAME_DIFFERENT_PATH);
export const ARTIFACT_NAME_COLLISION = compileString(NAME_COLLISION);
export const ARTIFACT_CONTRACT_NAME_COLLISION = compileString(CONTRACT_NAME_COLLISION);
export const ARTIFACT_FUNCTION_NAME_COLLISION = compileString(FUNCTION_NAME_COLLISION);
export const ARTIFACT_PREFIX_NAME = compileString(PREFIX_NAME);
export const ARTIFACT_PREFIXED_NAME = compileString(PREFIXED_NAME);
