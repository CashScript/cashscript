import { hexToBin } from '@bitauth/libauth';
import { BytesType, PrimitiveType } from '@cashscript/utils';
import {
  SourceFileNode,
  ContractNode,
  Ast,
  ParameterNode,
  FunctionDefinitionNode,
  BlockNode,
  RequireNode,
  BinaryOpNode,
  FunctionCallNode,
  IdentifierNode,
  VariableDefinitionNode,
  IntLiteralNode,
  StringLiteralNode,
  AssignNode,
  BranchNode,
  ArrayNode,
  CastNode,
  TimeOpNode,
  TupleAssignmentNode,
  NullaryOpNode,
  HexLiteralNode,
  UnaryOpNode,
  InstantiationNode,
} from '../../src/ast/AST.js';
import { BinaryOperator, NullaryOperator, UnaryOperator } from '../../src/ast/Operator.js';
import { Class, TimeOp } from '../../src/ast/Globals.js';

interface Fixture {
  fn: string,
  ast: Ast,
}

export const fixtures: Fixture[] = [
  {
    fn: 'p2pkh.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'P2PKH',
        [new ParameterNode(new BytesType(20), 'pkh')],
        [new FunctionDefinitionNode(
          'spend',
          [
            new ParameterNode(PrimitiveType.PUBKEY, 'pk'),
            new ParameterNode(PrimitiveType.SIG, 's'),
          ],
          new BlockNode([
            new RequireNode(
              new BinaryOpNode(
                new FunctionCallNode(new IdentifierNode('hash160'), [new IdentifierNode('pk')]),
                BinaryOperator.EQ,
                new IdentifierNode('pkh'),
              ),
            ),
            new RequireNode(
              new FunctionCallNode(
                new IdentifierNode('checkSig'),
                [new IdentifierNode('s'), new IdentifierNode('pk')],
              ),
            ),
          ]),
        )],
      ),
    ),
  },
  {
    fn: 'reassignment.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'Reassignment',
        [new ParameterNode(PrimitiveType.INT, 'x'), new ParameterNode(PrimitiveType.STRING, 'y')],
        [new FunctionDefinitionNode(
          'hello',
          [new ParameterNode(PrimitiveType.PUBKEY, 'pk'), new ParameterNode(PrimitiveType.SIG, 's')],
          new BlockNode([
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'myVariable',
              new BinaryOpNode(
                new IntLiteralNode(10),
                BinaryOperator.MINUS,
                new IntLiteralNode(4),
              ),
            ),
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'myOtherVariable',
              new BinaryOpNode(
                new IntLiteralNode(20),
                BinaryOperator.PLUS,
                new BinaryOpNode(
                  new IdentifierNode('myVariable'),
                  BinaryOperator.MOD,
                  new IntLiteralNode(2),
                ),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new IdentifierNode('myOtherVariable'),
                BinaryOperator.GT,
                new IdentifierNode('x'),
              ),
            ),
            new VariableDefinitionNode(
              PrimitiveType.STRING,
              'hw',
              new StringLiteralNode('Hello World', '"'),
            ),
            new AssignNode(
              new IdentifierNode('hw'),
              new BinaryOpNode(
                new IdentifierNode('hw'),
                BinaryOperator.PLUS,
                new IdentifierNode('y'),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new FunctionCallNode(new IdentifierNode('ripemd160'), [new IdentifierNode('pk')]),
                BinaryOperator.EQ,
                new FunctionCallNode(new IdentifierNode('ripemd160'), [new IdentifierNode('hw')]),
              ),
            ),
            new RequireNode(
              new FunctionCallNode(
                new IdentifierNode('checkSig'),
                [new IdentifierNode('s'), new IdentifierNode('pk')],
              ),
            ),
          ]),
        )],
      ),
    ),
  },
  {
    fn: 'multifunction_if_statements.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'MultiFunctionIfStatements',
        [new ParameterNode(PrimitiveType.INT, 'x'), new ParameterNode(PrimitiveType.INT, 'y')],
        [
          new FunctionDefinitionNode(
            'transfer',
            [new ParameterNode(PrimitiveType.INT, 'a'), new ParameterNode(PrimitiveType.INT, 'b')],
            new BlockNode([
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'd',
                new BinaryOpNode(
                  new IdentifierNode('a'),
                  BinaryOperator.PLUS,
                  new IdentifierNode('b'),
                ),
              ),
              new AssignNode(
                new IdentifierNode('d'),
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.MINUS,
                  new IdentifierNode('a'),
                ),
              ),
              new BranchNode(
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.EQ,
                  new IdentifierNode('x'),
                ),
                new BlockNode([
                  new VariableDefinitionNode(
                    PrimitiveType.INT,
                    'c',
                    new BinaryOpNode(
                      new IdentifierNode('d'),
                      BinaryOperator.PLUS,
                      new IdentifierNode('b'),
                    ),
                  ),
                  new AssignNode(
                    new IdentifierNode('d'),
                    new BinaryOpNode(
                      new IdentifierNode('a'),
                      BinaryOperator.PLUS,
                      new IdentifierNode('c'),
                    ),
                  ),
                  new RequireNode(
                    new BinaryOpNode(
                      new IdentifierNode('c'),
                      BinaryOperator.GT,
                      new IdentifierNode('d'),
                    ),
                  ),
                ]),
                new BlockNode([
                  new AssignNode(
                    new IdentifierNode('d'),
                    new IdentifierNode('a'),
                  ),
                ]),
              ),
              new AssignNode(
                new IdentifierNode('d'),
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.PLUS,
                  new IdentifierNode('a'),
                ),
              ),
              new RequireNode(
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.EQ,
                  new IdentifierNode('y'),
                ),
              ),
            ]),
          ),
          new FunctionDefinitionNode(
            'timeout',
            [new ParameterNode(PrimitiveType.INT, 'b')],
            new BlockNode([
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'd',
                new IdentifierNode('b'),
              ),
              new AssignNode(
                new IdentifierNode('d'),
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.PLUS,
                  new IntLiteralNode(2),
                ),
              ),
              new BranchNode(
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.EQ,
                  new IdentifierNode('x'),
                ),
                new BlockNode([
                  new VariableDefinitionNode(
                    PrimitiveType.INT,
                    'c',
                    new BinaryOpNode(
                      new IdentifierNode('d'),
                      BinaryOperator.PLUS,
                      new IdentifierNode('b'),
                    ),
                  ),
                  new AssignNode(
                    new IdentifierNode('d'),
                    new BinaryOpNode(
                      new IdentifierNode('c'),
                      BinaryOperator.PLUS,
                      new IdentifierNode('d'),
                    ),
                  ),
                  new RequireNode(
                    new BinaryOpNode(
                      new IdentifierNode('c'),
                      BinaryOperator.GT,
                      new IdentifierNode('d'),
                    ),
                  ),
                ]),
              ),
              new AssignNode(
                new IdentifierNode('d'),
                new IdentifierNode('b'),
              ),
              new RequireNode(
                new BinaryOpNode(
                  new IdentifierNode('d'),
                  BinaryOperator.EQ,
                  new IdentifierNode('y'),
                ),
              ),
            ]),
          ),
        ],
      ),
    ),
  },
  {
    fn: '2_of_3_multisig.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'MultiSig',
        [
          new ParameterNode(PrimitiveType.PUBKEY, 'pk1'),
          new ParameterNode(PrimitiveType.PUBKEY, 'pk2'),
          new ParameterNode(PrimitiveType.PUBKEY, 'pk3'),
        ],
        [new FunctionDefinitionNode(
          'spend',
          [
            new ParameterNode(PrimitiveType.SIG, 's1'),
            new ParameterNode(PrimitiveType.SIG, 's2'),
          ],
          new BlockNode([
            new RequireNode(
              new FunctionCallNode(
                new IdentifierNode('checkMultiSig'),
                [
                  new ArrayNode([
                    new IdentifierNode('s1'),
                    new IdentifierNode('s2'),
                  ]),
                  new ArrayNode([
                    new IdentifierNode('pk1'),
                    new IdentifierNode('pk2'),
                    new IdentifierNode('pk3'),
                  ]),
                ],
              ),
            ),
          ]),
        )],
      ),
    ),
  },
  {
    fn: 'hodl_vault.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'HodlVault',
        [
          new ParameterNode(PrimitiveType.PUBKEY, 'ownerPk'),
          new ParameterNode(PrimitiveType.PUBKEY, 'oraclePk'),
          new ParameterNode(PrimitiveType.INT, 'minBlock'),
          new ParameterNode(PrimitiveType.INT, 'priceTarget'),
        ],
        [new FunctionDefinitionNode(
          'spend',
          [
            new ParameterNode(PrimitiveType.SIG, 'ownerSig'),
            new ParameterNode(PrimitiveType.DATASIG, 'oracleSig'),
            new ParameterNode(new BytesType(8), 'oracleMessage'),
          ],
          new BlockNode([
            new TupleAssignmentNode(
              { name: 'blockHeightBin', type: new BytesType(4) },
              { name: 'priceBin', type: new BytesType(4) },
              new BinaryOpNode(
                new IdentifierNode('oracleMessage'),
                BinaryOperator.SPLIT,
                new IntLiteralNode(4),
              ),
            ),
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'blockHeight',
              new CastNode(
                PrimitiveType.INT,
                new IdentifierNode('blockHeightBin'),
              ),
            ),
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'price',
              new CastNode(
                PrimitiveType.INT,
                new IdentifierNode('priceBin'),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new IdentifierNode('blockHeight'),
                BinaryOperator.GE,
                new IdentifierNode('minBlock'),
              ),
            ),
            new TimeOpNode(
              TimeOp.CHECK_LOCKTIME,
              new IdentifierNode('blockHeight'),
            ),
            new RequireNode(
              new BinaryOpNode(
                new IdentifierNode('price'),
                BinaryOperator.GE,
                new IdentifierNode('priceTarget'),
              ),
            ),
            new RequireNode(
              new FunctionCallNode(
                new IdentifierNode('checkDataSig'),
                [
                  new IdentifierNode('oracleSig'),
                  new IdentifierNode('oracleMessage'),
                  new IdentifierNode('oraclePk'),
                ],
              ),
            ),
            new RequireNode(
              new FunctionCallNode(
                new IdentifierNode('checkSig'),
                [
                  new IdentifierNode('ownerSig'),
                  new IdentifierNode('ownerPk'),
                ],
              ),
            ),
          ]),
        )],
      ),
    ),
  },
  {
    fn: 'covenant_all_fields.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'Covenant',
        [],
        [new FunctionDefinitionNode(
          'spend',
          [],
          new BlockNode([
            new RequireNode(
              new BinaryOpNode(
                new NullaryOpNode(NullaryOperator.VERSION),
                BinaryOperator.EQ,
                new IntLiteralNode(2),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new NullaryOpNode(NullaryOperator.LOCKTIME),
                BinaryOperator.EQ,
                new IntLiteralNode(0),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new NullaryOpNode(NullaryOperator.INPUT_COUNT),
                BinaryOperator.EQ,
                new IntLiteralNode(1),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new NullaryOpNode(NullaryOperator.OUTPUT_COUNT),
                BinaryOperator.EQ,
                new IntLiteralNode(1),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new NullaryOpNode(NullaryOperator.INPUT_INDEX),
                BinaryOperator.EQ,
                new IntLiteralNode(0),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.SIZE,
                  new NullaryOpNode(NullaryOperator.BYTECODE),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(300),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.INPUT_VALUE,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(10000),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.SIZE,
                  new UnaryOpNode(
                    UnaryOperator.INPUT_LOCKING_BYTECODE,
                    new IntLiteralNode(0),
                  ),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(10000),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.INPUT_OUTPOINT_HASH,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new HexLiteralNode(hexToBin('000000000000000000000000000000000000000000000000000000000000000')),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.INPUT_OUTPOINT_INDEX,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(0),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.SIZE,
                  new UnaryOpNode(
                    UnaryOperator.INPUT_UNLOCKING_BYTECODE,
                    new IntLiteralNode(0),
                  ),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(100),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.INPUT_SEQUENCE_NUMBER,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(0),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.OUTPUT_VALUE,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(10000),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.SIZE,
                  new UnaryOpNode(
                    UnaryOperator.OUTPUT_LOCKING_BYTECODE,
                    new IntLiteralNode(0),
                  ),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(100),
              ),
            ),
          ]),
        )],
      ),
    ),
  },
  {
    fn: 'mecenas.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'Mecenas',
        [
          new ParameterNode(new BytesType(20), 'recipient'),
          new ParameterNode(new BytesType(20), 'funder'),
          new ParameterNode(PrimitiveType.INT, 'pledge'),
          new ParameterNode(PrimitiveType.INT, 'period'),
        ],
        [
          new FunctionDefinitionNode(
            'receive',
            [],
            new BlockNode([
              new TimeOpNode(
                TimeOp.CHECK_SEQUENCE,
                new IdentifierNode('period'),
              ),
              new RequireNode(
                new BinaryOpNode(
                  new UnaryOpNode(
                    UnaryOperator.OUTPUT_LOCKING_BYTECODE,
                    new IntLiteralNode(0),
                  ),
                  BinaryOperator.EQ,
                  new InstantiationNode(
                    new IdentifierNode(Class.LOCKING_BYTECODE_P2PKH),
                    [new IdentifierNode('recipient')],
                  ),
                ),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'minerFee',
                new IntLiteralNode(1000),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'currentValue',
                new UnaryOpNode(
                  UnaryOperator.INPUT_VALUE,
                  new NullaryOpNode(NullaryOperator.INPUT_INDEX),
                ),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'changeValue',
                new BinaryOpNode(
                  new BinaryOpNode(
                    new IdentifierNode('currentValue'),
                    BinaryOperator.MINUS,
                    new IdentifierNode('pledge'),
                  ),
                  BinaryOperator.MINUS,
                  new IdentifierNode('minerFee'),
                ),
              ),
              new BranchNode(
                new BinaryOpNode(
                  new IdentifierNode('changeValue'),
                  BinaryOperator.LE,
                  new BinaryOpNode(
                    new IdentifierNode('pledge'),
                    BinaryOperator.PLUS,
                    new IdentifierNode('minerFee'),
                  ),
                ),
                new BlockNode([
                  new RequireNode(
                    new BinaryOpNode(
                      new UnaryOpNode(
                        UnaryOperator.OUTPUT_VALUE,
                        new IntLiteralNode(0),
                      ),
                      BinaryOperator.EQ,
                      new BinaryOpNode(
                        new IdentifierNode('currentValue'),
                        BinaryOperator.MINUS,
                        new IdentifierNode('minerFee'),
                      ),
                    ),
                  ),
                ]),
                new BlockNode([
                  new RequireNode(
                    new BinaryOpNode(
                      new UnaryOpNode(
                        UnaryOperator.OUTPUT_VALUE,
                        new IntLiteralNode(0),
                      ),
                      BinaryOperator.EQ,
                      new IdentifierNode('pledge'),
                    ),
                  ),
                  new RequireNode(
                    new BinaryOpNode(
                      new UnaryOpNode(
                        UnaryOperator.OUTPUT_LOCKING_BYTECODE,
                        new IntLiteralNode(1),
                      ),
                      BinaryOperator.EQ,
                      new UnaryOpNode(
                        UnaryOperator.INPUT_LOCKING_BYTECODE,
                        new NullaryOpNode(NullaryOperator.INPUT_INDEX),
                      ),
                    ),
                  ),
                  new RequireNode(
                    new BinaryOpNode(
                      new UnaryOpNode(
                        UnaryOperator.OUTPUT_VALUE,
                        new IntLiteralNode(1),
                      ),
                      BinaryOperator.EQ,
                      new IdentifierNode('changeValue'),
                    ),
                  ),
                ]),
              ),
            ]),
          ),
          new FunctionDefinitionNode(
            'reclaim',
            [
              new ParameterNode(PrimitiveType.PUBKEY, 'pk'),
              new ParameterNode(PrimitiveType.SIG, 's'),
            ],
            new BlockNode([
              new RequireNode(
                new BinaryOpNode(
                  new FunctionCallNode(
                    new IdentifierNode('hash160'),
                    [new IdentifierNode('pk')],
                  ),
                  BinaryOperator.EQ,
                  new IdentifierNode('funder'),
                ),
              ),
              new RequireNode(
                new FunctionCallNode(
                  new IdentifierNode('checkSig'),
                  [
                    new IdentifierNode('s'),
                    new IdentifierNode('pk'),
                  ],
                ),
              ),
            ]),
          ),
        ],
      ),
    ),
  },
  {
    fn: 'announcement.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'Announcement',
        [],
        [new FunctionDefinitionNode(
          'announce',
          [],
          new BlockNode([
            new VariableDefinitionNode(
              new BytesType(),
              'announcement',
              new InstantiationNode(
                new IdentifierNode(Class.LOCKING_BYTECODE_NULLDATA),
                [new ArrayNode([
                  new HexLiteralNode(hexToBin('6d02')),
                  new CastNode(
                    new BytesType(),
                    new StringLiteralNode('A contract may not injure a human being or, through inaction, allow a human being to come to harm.', '\''),
                  ),
                ])],
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.OUTPUT_VALUE,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new IntLiteralNode(0),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.OUTPUT_LOCKING_BYTECODE,
                  new IntLiteralNode(0),
                ),
                BinaryOperator.EQ,
                new IdentifierNode('announcement'),
              ),
            ),
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'minerFee',
              new IntLiteralNode(1000),
            ),
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'changeAmount',
              new BinaryOpNode(
                new UnaryOpNode(
                  UnaryOperator.INPUT_VALUE,
                  new NullaryOpNode(NullaryOperator.INPUT_INDEX),
                ),
                BinaryOperator.MINUS,
                new IdentifierNode('minerFee'),
              ),
            ),
            new BranchNode(
              new BinaryOpNode(
                new IdentifierNode('changeAmount'),
                BinaryOperator.GE,
                new IdentifierNode('minerFee'),
              ),
              new BlockNode([
                new RequireNode(
                  new BinaryOpNode(
                    new UnaryOpNode(
                      UnaryOperator.OUTPUT_LOCKING_BYTECODE,
                      new IntLiteralNode(1),
                    ),
                    BinaryOperator.EQ,
                    new UnaryOpNode(
                      UnaryOperator.INPUT_LOCKING_BYTECODE,
                      new NullaryOpNode(NullaryOperator.INPUT_INDEX),
                    ),
                  ),
                ),
                new RequireNode(
                  new BinaryOpNode(
                    new UnaryOpNode(
                      UnaryOperator.OUTPUT_VALUE,
                      new IntLiteralNode(1),
                    ),
                    BinaryOperator.EQ,
                    new IdentifierNode('changeAmount'),
                  ),
                ),
              ]),
            ),
          ]),
        )],
      ),
    ),
  },
];
