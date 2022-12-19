![CI](https://github.com/lyrasearch/plugin-docusaurus/actions/workflows/ci.yml/badge.svg?event=push)

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

The plugin can be found in './plugin-docusaurus'. A "fresh" docusaurus app can
be found in './website' with the plugin configured.

To test running the plugin locally run:

```
npm i
cd website
npm run build && npm run serve
```
