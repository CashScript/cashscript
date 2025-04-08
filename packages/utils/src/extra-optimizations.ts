export default [
  ['OP_NOT OP_IF', 'OP_NOTIF'],
  ['OP_CHECKMULTISIG OP_VERIFY', 'OP_CHECKMULTISIGVERIFY'],
  ['OP_SWAP OP_AND', 'OP_AND'],
  ['OP_SWAP OP_OR', 'OP_OR'],
  ['OP_SWAP OP_XOR', 'OP_XOR'],
  ['OP_DUP OP_AND', ''],
  ['OP_DUP OP_OR', ''],
] as [string, string][];
