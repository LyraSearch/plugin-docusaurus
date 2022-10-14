# Contributing

## Project structure

In the `src` directory there is the source code of the plugin to be modified.

As any other Docusaurus plugin, there is a division between the `server` and the `client` parts of the plugin.

The `server` part implements the generation of the JSON index at build time, reading the documentation content through each produced HTML file.

The `client` part implements the React component that will be shown to the user once docusaurus is up and running.
