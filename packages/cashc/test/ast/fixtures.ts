import { hexToBin } from '@bitauth/libauth';
import { BytesType, PrimitiveType } from '../../src';
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
  TupleIndexOpNode,
  TimeOpNode,
  HexLiteralNode,
  InstantiationNode,
} from '../../src/ast/AST';
import { BinaryOperator } from '../../src/ast/Operator';
import {
  TimeOp,
  PreimageField,
  Class,
  GlobalFunction,
} from '../../src/ast/Globals';

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
          [],
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
          [],
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
            [],
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
            [],
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
          [],
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
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'blockHeight',
              new CastNode(
                PrimitiveType.INT,
                new TupleIndexOpNode(
                  new BinaryOpNode(
                    new IdentifierNode('oracleMessage'),
                    BinaryOperator.SPLIT,
                    new IntLiteralNode(4),
                  ),
                  0,
                ),
              ),
            ),
            new VariableDefinitionNode(
              PrimitiveType.INT,
              'price',
              new CastNode(
                PrimitiveType.INT,
                new TupleIndexOpNode(
                  new BinaryOpNode(
                    new IdentifierNode('oracleMessage'),
                    BinaryOperator.SPLIT,
                    new IntLiteralNode(4),
                  ),
                  1,
                ),
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
          [],
        )],
      ),
    ),
  },
  {
    fn: 'covenant.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'Covenant',
        [new ParameterNode(new BytesType(4), 'requiredVersion')],
        [new FunctionDefinitionNode(
          'spend',
          [
            new ParameterNode(PrimitiveType.PUBKEY, 'pk'),
            new ParameterNode(PrimitiveType.SIG, 's'),
          ],
          new BlockNode([
            new RequireNode(
              new BinaryOpNode(
                new IdentifierNode(PreimageField.VERSION),
                BinaryOperator.EQ,
                new IdentifierNode('requiredVersion'),
              ),
            ),
            new RequireNode(
              new BinaryOpNode(
                new IdentifierNode(PreimageField.BYTECODE),
                BinaryOperator.EQ,
                new HexLiteralNode(hexToBin('00')),
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
          [PreimageField.VERSION, PreimageField.BYTECODE],
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
            [
              new ParameterNode(PrimitiveType.PUBKEY, 'pk'),
              new ParameterNode(PrimitiveType.SIG, 's'),
            ],
            new BlockNode([
              new RequireNode(
                new FunctionCallNode(
                  new IdentifierNode('checkSig'),
                  [
                    new IdentifierNode('s'),
                    new IdentifierNode('pk'),
                  ],
                ),
              ),
              new TimeOpNode(
                TimeOp.CHECK_SEQUENCE,
                new IdentifierNode('period'),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'minerFee',
                new IntLiteralNode(1000),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'intValue',
                new CastNode(
                  PrimitiveType.INT,
                  new CastNode(new BytesType(), new IdentifierNode(PreimageField.VALUE)),
                ),
              ),
              new BranchNode(
                new BinaryOpNode(
                  new IdentifierNode('intValue'),
                  BinaryOperator.LE,
                  new BinaryOpNode(
                    new IdentifierNode('pledge'),
                    BinaryOperator.PLUS,
                    new IdentifierNode('minerFee'),
                  ),
                ),
                // bytes8(int(bytes(tx.value)) - minerFee);
                new BlockNode([
                  new VariableDefinitionNode(
                    new BytesType(8),
                    'amount1',
                    new CastNode(
                      new BytesType(8),
                      new BinaryOpNode(
                        new IdentifierNode('intValue'),
                        BinaryOperator.MINUS,
                        new IdentifierNode('minerFee'),
                      ),
                    ),
                  ),
                  new VariableDefinitionNode(
                    new BytesType(34),
                    'out1',
                    new InstantiationNode(
                      new IdentifierNode(Class.OUTPUT_P2PKH),
                      [new IdentifierNode('amount1'), new IdentifierNode('recipient')],
                    ),
                  ),
                  new RequireNode(
                    new BinaryOpNode(
                      new FunctionCallNode(
                        new IdentifierNode('hash256'),
                        [new IdentifierNode('out1')],
                      ),
                      BinaryOperator.EQ,
                      new IdentifierNode(PreimageField.HASHOUTPUTS),
                    ),
                  ),
                ]),
                new BlockNode([
                  new VariableDefinitionNode(
                    new BytesType(8),
                    'amount1',
                    new CastNode(new BytesType(8), new IdentifierNode('pledge')),
                  ),
                  new VariableDefinitionNode(
                    new BytesType(8),
                    'amount2',
                    new CastNode(
                      new BytesType(8),
                      new BinaryOpNode(
                        new BinaryOpNode(
                          new IdentifierNode('intValue'),
                          BinaryOperator.MINUS,
                          new IdentifierNode('pledge'),
                        ),
                        BinaryOperator.MINUS,
                        new IdentifierNode('minerFee'),
                      ),
                    ),
                  ),
                  new VariableDefinitionNode(
                    new BytesType(34),
                    'out1',
                    new InstantiationNode(
                      new IdentifierNode(Class.OUTPUT_P2PKH),
                      [new IdentifierNode('amount1'), new IdentifierNode('recipient')],
                    ),
                  ),
                  new VariableDefinitionNode(
                    new BytesType(32),
                    'out2',
                    new InstantiationNode(
                      new IdentifierNode(Class.OUTPUT_P2SH),
                      [
                        new IdentifierNode('amount2'), new FunctionCallNode(
                          new IdentifierNode('hash160'),
                          [new IdentifierNode(PreimageField.BYTECODE)],
                        ),
                      ],
                    ),
                  ),
                  new RequireNode(
                    new BinaryOpNode(
                      new FunctionCallNode(
                        new IdentifierNode('hash256'),
                        [new BinaryOpNode(
                          new IdentifierNode('out1'),
                          BinaryOperator.PLUS,
                          new IdentifierNode('out2'),
                        )],
                      ),
                      BinaryOperator.EQ,
                      new IdentifierNode(PreimageField.HASHOUTPUTS),
                    ),
                  ),
                ]),
              ),
            ]),
            [
              PreimageField.VALUE,
              PreimageField.HASHOUTPUTS,
              PreimageField.BYTECODE,
            ],
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
            [],
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
          [
            new ParameterNode(PrimitiveType.PUBKEY, 'pk'),
            new ParameterNode(PrimitiveType.SIG, 's'),
          ],
          new BlockNode([
            new RequireNode(new FunctionCallNode(
              new IdentifierNode(GlobalFunction.CHECKSIG),
              [new IdentifierNode('s'), new IdentifierNode('pk')],
            )),
            new VariableDefinitionNode(
              new BytesType(),
              'announcement',
              new InstantiationNode(
                new IdentifierNode(Class.OUTPUT_NULLDATA),
                [new ArrayNode([
                  new HexLiteralNode(hexToBin('6d02')),
                  new CastNode(
                    new BytesType(),
                    new StringLiteralNode('A contract may not injure a human being or, through inaction, allow a human being to come to harm.', '\''),
                  ),
                ])],
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
                new CastNode(
                  PrimitiveType.INT,
                  new CastNode(new BytesType(), new IdentifierNode(PreimageField.VALUE)),
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
                new VariableDefinitionNode(
                  new BytesType(32),
                  'change',
                  new InstantiationNode(
                    new IdentifierNode(Class.OUTPUT_P2SH),
                    [
                      new CastNode(
                        new BytesType(8),
                        new IdentifierNode('changeAmount'),
                      ),
                      new FunctionCallNode(
                        new IdentifierNode(GlobalFunction.HASH160),
                        [new IdentifierNode(PreimageField.BYTECODE)],
                      ),
                    ],
                  ),
                ),
                new RequireNode(
                  new BinaryOpNode(
                    new IdentifierNode(PreimageField.HASHOUTPUTS),
                    BinaryOperator.EQ,
                    new FunctionCallNode(
                      new IdentifierNode(GlobalFunction.HASH256),
                      [new BinaryOpNode(
                        new IdentifierNode('announcement'),
                        BinaryOperator.PLUS,
                        new IdentifierNode('change'),
                      )],
                    ),
                  ),
                ),
              ]),
              new BlockNode([
                new RequireNode(
                  new BinaryOpNode(
                    new IdentifierNode(PreimageField.HASHOUTPUTS),
                    BinaryOperator.EQ,
                    new FunctionCallNode(
                      new IdentifierNode(GlobalFunction.HASH256),
                      [new IdentifierNode('announcement')],
                    ),
                  ),
                ),
              ]),
            ),
          ]),
          [
            PreimageField.VALUE,
            PreimageField.BYTECODE,
            PreimageField.HASHOUTPUTS,
          ],
        )],
      ),
    ),
  },
];
