module.exports = {
  title: 'CashScript',
  tagline: 'Smart contracts for Bitcoin Cash',
  url: 'https://cashscript.org',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'CashScript',
  projectName: 'cashscript',
  themeConfig: {
    prism: {
      theme: require('prism-react-renderer').themes.nightOwlLight,
      darkTheme: require('prism-react-renderer').themes.nightOwl,
      additionalLanguages: ['solidity', 'antlr4'],
    },
    image: 'img/logo.svg',
    navbar: {
      logo: {
        alt: 'CashScript',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/docs/basics/about', label: 'Docs', position: 'right'},
        {
          href: 'https://playground.cashscript.org',
          label: 'Playground',
          position: 'right',
        },
        {
          href: 'https://github.com/CashScript/cashscript',
          label: 'GitHub',
          position: 'right',
        },
      ],
      style: 'dark',
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/basics/getting-started',
            },
            {
              label: 'Examples',
              to: '/docs/language/examples',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Telegram',
              href: 'https://t.me/CashScriptBCH',
            },
            {
              label: 'Showcase',
              to: '/docs/showcase',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Kalis.me',
              href: 'https://kalis.me',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/CashScriptBCH',
            },
          ],
        },
        {
          title: 'Sponsors',
          items: [
            {
              html: `
                <a href="https://generalprotocols.com" target="_blank">
                  <img src="/img/general-protocols.png" alt="General Protocols"
                       style="border-radius: 5px; max-height: 55px" />
                </a>
              `,
            },
          ],
        },
      ],
      copyright: `<b>Donations:</b> bitcoincash:qz6uftqp7dyc4ca9e94d7wsle06u0z2ccc223dkpl8`,
    },
    algolia: {
      apiKey: 'd1e059f9bd6bf56667612a41a5115c6b',
      appId: 'XBVJRKV38F',
      indexName: 'cashscript'
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        docs: {
          sidebarPath: './sidebars.js',
        },
      },
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html'],
        redirects: [
          { from: ['/docs', '/docs/about', '/docs/basics'], to: '/docs/basics/about'},
          { from: '/docs/language', to: '/docs/language/contracts' },
          { from: '/docs/sdk', to: '/docs/sdk/instantiation' },
          { from: '/docs/sdk/transactions', to: '/docs/releases/migration-notes' },
          { from: '/docs/sdk/transactions-advanced', to: '/docs/sdk/transaction-builder' },
          { from: '/docs/guides', to: '/docs/guides/covenants' },
          { from: '/docs/getting-started', to: '/docs/basics/getting-started' },
          { from: '/docs/examples', to: '/docs/language/examples' },
        ],
      },
    ],
    ['@branchup/docusaurus-plugin-simple-analytics', {}],
  ],
};
