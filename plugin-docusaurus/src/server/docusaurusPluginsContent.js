const buildPluginObject = pluginName => plugins => {
  return plugins
    .filter(plugin => plugin.name === pluginName)
    .reduce((accumulator, plugin) => {
      accumulator[plugin.options.id] = plugin
      return accumulator
    }, {})
}

const docsPluginsReducer = buildPluginObject('docusaurus-plugin-content-docs')
const blogPluginsReducer = buildPluginObject('docusaurus-plugin-content-blog')
const pagesPluginsReducer = buildPluginObject('docusaurus-plugin-content-pages')

const retrieveDocusaurusPluginsContent = plugins => {
  return {
    docsPlugins: docsPluginsReducer(plugins),
    blogPlugins: blogPluginsReducer(plugins),
    pagesPlugins: pagesPluginsReducer(plugins)
  }
}

const assertIndexContent = (
  { indexDocs, indexBlog, indexPages },
  { docsPlugins, blogPlugins, pagesPlugins }
) => {
  if (indexDocs && docsPlugins.size === 0) {
    throw new Error(
      'The "indexDocs" option is enabled but no docs plugin has been found.'
    )
  }
  if (indexBlog && blogPlugins.size === 0) {
    throw new Error(
      'The "indexBlog" option is enabled but no blog plugin has been found.'
    )
  }
  if (indexPages && pagesPlugins.size === 0) {
    throw new Error(
      'The "indexPages" option is enabled but no pages plugin has been found.'
    )
  }
}

module.exports = {
  retrieveDocusaurusPluginsContent,
  assertIndexContent
}
