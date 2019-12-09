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
  SplitOpNode,
  TimeOpNode,
  HexLiteralNode,
  InstantiationNode,
} from '../../src/ast/AST';
import { BinaryOperator } from '../../src/ast/Operator';
import { TimeOp, PreimageField, Class } from '../../src/ast/Globals';

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
                  new SplitOpNode(
                    new IdentifierNode('oracleMessage'),
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
                  new SplitOpNode(
                    new IdentifierNode('oracleMessage'),
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
                new HexLiteralNode(Buffer.from('00', 'hex')),
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
    fn: 'mecenas_v1.cash',
    ast: new SourceFileNode(
      new ContractNode(
        'Mecenas',
        [
          new ParameterNode(new BytesType(20), 'recipient'),
          new ParameterNode(new BytesType(20), 'funder'),
          new ParameterNode(PrimitiveType.INT, 'pledge'),
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
                new IntLiteralNode(30 * 24 * 60 * 60),
              ),
              new RequireNode(
                new BinaryOpNode(
                  new CastNode(PrimitiveType.INT, new IdentifierNode(PreimageField.VERSION)),
                  BinaryOperator.GE,
                  new IntLiteralNode(2),
                ),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'fee',
                new IntLiteralNode(1000),
              ),
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
                      new CastNode(
                        PrimitiveType.INT,
                        new CastNode(new BytesType(), new IdentifierNode(PreimageField.VALUE)),
                      ),
                      BinaryOperator.MINUS,
                      new IdentifierNode('pledge'),
                    ),
                    BinaryOperator.MINUS,
                    new IdentifierNode('fee'),
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
            [
              PreimageField.VERSION,
              PreimageField.VALUE,
              PreimageField.BYTECODE,
              PreimageField.HASHOUTPUTS,
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
              new RequireNode(
                new BinaryOpNode(
                  new CastNode(PrimitiveType.INT, new IdentifierNode(PreimageField.VERSION)),
                  BinaryOperator.GE,
                  new IntLiteralNode(2),
                ),
              ),
              new VariableDefinitionNode(
                PrimitiveType.INT,
                'fee',
                new IntLiteralNode(1000),
              ),
              new BranchNode(
                new BinaryOpNode(
                  new CastNode(
                    PrimitiveType.INT,
                    new CastNode(
                      new BytesType(),
                      new IdentifierNode(PreimageField.VALUE),
                    ),
                  ),
                  BinaryOperator.LE,
                  new BinaryOpNode(
                    new IdentifierNode('pledge'),
                    BinaryOperator.PLUS,
                    new IdentifierNode('fee'),
                  ),
                ),
                new BlockNode([
                  new VariableDefinitionNode(
                    new BytesType(34),
                    'out1',
                    new InstantiationNode(
                      new IdentifierNode(Class.OUTPUT_P2PKH),
                      [new IdentifierNode(PreimageField.VALUE), new IdentifierNode('recipient')],
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
                          new CastNode(
                            PrimitiveType.INT,
                            new CastNode(new BytesType(), new IdentifierNode(PreimageField.VALUE)),
                          ),
                          BinaryOperator.MINUS,
                          new IdentifierNode('pledge'),
                        ),
                        BinaryOperator.MINUS,
                        new IdentifierNode('fee'),
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
              PreimageField.VERSION,
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
];
