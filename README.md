![CI](https://github.com/lyrasearch/plugin-docusaurus/actions/workflows/ci.yml/badge.svg?event=push)

# Docusaurus Lyra Search Plugin

## Usage

Install the plugin:

```bash
npm install --save @lyrasearch/plugin-docusaurus
```

```bash
yarn add @lyrasearch/plugin-docusaurus
```

Add the plugin to your `docusaurus.config.js`:

```js
plugins: ["@lyrasearch/plugin-docusaurus"];
```

## Testing the plugin Locally

This is a Docusaurus Search Plugin powered by
[Lyra](https://github.com/lyrasearch/lyra).

The plugin can be found in `./plugin-docusaurus`. A "fresh" docusaurus app can
be found in `./website` with the plugin configured.

To test running the plugin locally run:

```bash
pnpm i --frozen-lockfile
pnpm run build-serve
```

**Note** the plugin generates the search index in the `postBuild` lifecycle of docusaurus plugins. This only runs on production builds, not when running locally with a dev server. 

In dev builds the search index is composed from the md files so MDX custom components may not be indexed properly. 

To test the plugin in dev mode run:

```bash
pnpm i --frozen-lockfile
pnpm run start
```

# License

Licensed under the [Apache 2.0](/LICENSE.md) license.
