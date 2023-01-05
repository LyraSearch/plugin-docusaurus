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

```
npm i
cd website
npm run build && npm run serve
```

**Note** the plugin generates the search index in the `postBuild` lifecycle of docusaurus plugins. This only runs on production builds, not when running locally with a dev server. So search results will only be populated on production builds

You can use the watch scripts in the `plugin-docusaurus` package to recompile the source code for the plugin.

If you need search results you will need to re-run the docusaurus build and serve commands every time you make a change to the plugin. If you don't need search results you can just run `npm start` in the `website` plus whichever watch scripts you need from the plugin and you will get hot reloads in the docusaurus app.

# License

Licensed under the [Apache 2.0](/LICENSE.md) license.

