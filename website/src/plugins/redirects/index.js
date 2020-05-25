const { docuHash } = require('@docusaurus/utils');

const redirects = [
  ['/docs/', '/docs/basics/about/'],
  ['/docs/about/', '/docs/basics/about/'],
  ['/docs/basics/', '/docs/basics/about/'],
  ['/docs/language/', '/docs/language/contracts/'],
  ['/docs/sdk/', '/docs/sdk/instantiation/'],
  ['/docs/guides/', '/docs/guides/covenants/'],
  ['/docs/getting-started/', '/docs/basics/getting-started/'],
  ['/docs/examples/', '/docs/language/examples/'],
];

module.exports = function () {
  return {
    name: 'docusaurus-plugin',
    async contentLoaded({ actions }) {
      const { addRoute, createData } = actions;

      await Promise.all(
        redirects.map(async redirect => {
          const dest = JSON.stringify({ to: redirect[1] });
          const destPath = await createData(`${docuHash(redirect[0])}.json`, dest);

          addRoute({
            path: redirect[0],
            component: '@site/src/exports/redirect.js',
            modules: { dest: destPath },
            exact: true,
          });
        }),
      );
    },
  };
};
