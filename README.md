![CI](https://github.com/nearform/docusaurus-lyra-search-plugin/actions/workflows/ci.yml/badge.svg?event=push)

# Docusaurus Lyra Search Plugin

## Usage

Install the plugin:

```bash
npm install --save @lyrasearch/docusaurus-lyra-search-plugin
```

Add the plugin to your `docusaurus.config.js`:

```js
plugins: ['@lyrasearch/docusaurus-lyra-search-plugin']
```

## Testing the plugin Locally

This is a Docusaurus Search Plugin powered by LyraJS.

The plugin can be found in `./docusaurus-lyra-search-plugin`. A "fresh" docusaurus app can be found in `./website` with the plugin configured.

To test running the plugin locally run:

```
npm i
npm run build-serve
```


## Local development

**Note** the plugin generates the search index in the `postBuild` lifecycle of docusaurus plugins. This only runs on production builds, not when running locally with a dev server. So search results will only be populated on production builds

You can use the watch scripts in the `docusaurus-lyra-search-plugin` package to recompile the source code for the plugin.

If you need search results you will need to re-run the docusaurus build and serve commands every time you make a change to the plugin. If you don't need search results you can just run `npm start` in the `website` plus whichever watch scripts you need from the plugin and you will get hot reloads in the docusaurus app.
