module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Basics',
      items: [
        'basics/about',
        // 'basics/about-bch',
        'basics/getting-started',
        'basics/cli',
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
        'language/artifacts',
        'language/grammar',
        'language/examples',
      ],
    },
    {
      type: 'category',
      label: 'JavaScript SDK',
      items: [
        'sdk/instantiation',
        'sdk/transactions',
        'sdk/transactions-advanced',
        'sdk/examples',
        'sdk/debugging',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/syntax-highlighting',
        'guides/covenants',
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
