const path = require('path');

module.exports = {
  title: 'CashScript',
  tagline: 'Smart contracts for Bitcoin Cash',
  url: 'https://cashscript.org',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'CashScript',
  projectName: 'CashScript',
  themeConfig: {
    prism: {
      theme: require('prism-react-renderer/themes/nightOwlLight'),
      darkTheme: require('prism-react-renderer/themes/nightOwl'),
      additionalLanguages: ['solidity', 'antlr4'],
    },
    image: 'img/logo.svg',
    navbar: {
      title: 'CashScript',
      logo: {
        alt: 'CashScript',
        src: 'img/logo.svg',
      },
      links: [
        {to: '/docs/', label: 'Docs', position: 'right'},
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
              to: '/docs/getting-started',
            },
            {
              label: 'Examples',
              to: '/docs/examples',
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
      copyright: `Copyright © ${new Date().getFullYear()} Rosco Kalis.`,
    },
    googleAnalytics: {
      trackingID: 'UA-26805430-6',
    },
    algolia: {
      apiKey: '440b18c1b71e4e50ed7ba801c2e731aa',
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
    path.resolve(__dirname, './src/plugins/redirects'),
  ],
};
