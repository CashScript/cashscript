We use yarn workspaces + lerna for monorepo management. So to get started, clone this repository and run `yarn` in the root directory to install all dependencies for all packages.

When updating code in one package, you can run `yarn build` in the root directory to build all packages so the changes get propagated to the other packages as well.

### Publishing a release

To publish a new release, we use `yarn update-version 'x.x.x'` in the root directory to bump the version before release, and then `yarn publish-all` in the root directory to publish the release. In case of a tagged release (such as `next`), we use `yarn publish-all --dist-tag <tag name>` to publish the release with the specified tag.
