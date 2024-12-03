interface Fixture {
  fn: string,
  fnWithLogs: string,
}

export const fixtures: Fixture[] = [
  {
    fn: 'p2pkh.cash',
    fnWithLogs: 'p2pkh-logs.cash',
  },
  {
    fn: 'if_statement_number_units.cash',
    fnWithLogs: 'if_statement_number_units-logs.cash',
  },
  {
    fn: 'deeply_nested.cash',
    fnWithLogs: 'deeply_nested-logs.cash',
  },
];
