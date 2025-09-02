module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Basics',
      items: [
        'basics/about',
        'basics/about-bch',
        'basics/getting-started',
      ],
    },
    {
      type: 'category',
      label: 'Language Description',
      items: [
        'language/contracts',
        'language/types',
        'language/functions',
        'language/globals',
        'language/examples',
        'language/syntax-highlighting'
      ],
    },
    {
      type: 'category',
      label: 'Compiler',
      items: [
        'compiler/compiler',
        'compiler/script-limits',
        'compiler/artifacts',
        'compiler/grammar',
      ],
    },
    {
      type: 'category',
      label: 'TypeScript SDK',
      items: [
        'sdk/instantiation',
        'sdk/transaction-builder',
        {
          type: 'category',
          label: 'Network Providers',
          items: [
            'sdk/network-provider',
            'sdk/electrum-network-provider',
            'sdk/other-network-providers',
          ],
        },
        'sdk/signature-templates',
        'sdk/testing-setup',
        'sdk/examples',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/covenants',
        'guides/cashtokens',
        'guides/infrastructure',
        'guides/walletconnect',
        'guides/debugging',
        'guides/optimization'
      ],
    },
    {
      type: 'category',
      label: 'Releases',
      items: [
        'releases/release-notes',
        'releases/migration-notes',
      ],
    },
    'showcase',
  ],
};
