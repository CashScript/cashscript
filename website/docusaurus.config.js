const path = require('path');

module.exports = {
  title: 'CashScript',
  tagline: 'Smart contracts for Bitcoin Cash',
  url: 'https://cashscript.org',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'Bitcoin-com',
  projectName: 'cashscript',
  themeConfig: {
    prism: {
      theme: require('prism-react-renderer/themes/nightOwlLight'),
      darkTheme: require('prism-react-renderer/themes/nightOwl'),
      additionalLanguages: ['solidity', 'antlr4'],
    },
    image: 'img/logo.svg',
    navbar: {
      logo: {
        alt: 'CashScript',
        src: 'img/logo.svg',
      },
      links: [
        {to: '/docs/basics/about', label: 'Docs', position: 'right'},
        {
          href: 'https://github.com/Bitcoin-com/cashscript',
          label: 'GitHub',
          position: 'right',
        },
      ],
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
              href: 'https://t.me/bch_compilers',
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
              href: 'https://twitter.com/RoscoKalis',
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
    googleAnalytics: {
      trackingID: 'UA-26805430-6',
    },
    algolia: {
      apiKey: 'b0b29787f1ed36aa2c1057bf4f6e6dde',
      indexName: 'cashscript',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/Bitcoin-com/cashscript/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
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
          { from: '/docs/guides', to: '/docs/guides/covenants' },
          { from: '/docs/getting-started', to: '/docs/basics/getting-started' },
          { from: '/docs/examples', to: '/docs/language/examples' },
        ],
      },
    ],
  ],
};
