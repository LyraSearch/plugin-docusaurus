import { LoadedPlugin } from '@docusaurus/types'
import { PluginAccumulator, CategorizedPlugins, IndexFlags } from './types'

const buildPluginObject =
  (pluginName: string) =>
  (plugins: LoadedPlugin[]): PluginAccumulator => {
    return plugins
      .filter(plugin => plugin.name === pluginName)
      .reduce((accumulator, plugin) => {
        accumulator[plugin.options.id] = plugin
        return accumulator
      }, {} as PluginAccumulator)
  }

const docsPluginsReducer = buildPluginObject('docusaurus-plugin-content-docs')
const blogPluginsReducer = buildPluginObject('docusaurus-plugin-content-blog')
const pagesPluginsReducer = buildPluginObject('docusaurus-plugin-content-pages')

export const retrieveDocusaurusPluginsContent = (
  plugins: LoadedPlugin[]
): CategorizedPlugins => {
  return {
    docsPlugins: docsPluginsReducer(plugins),
    blogPlugins: blogPluginsReducer(plugins),
    pagesPlugins: pagesPluginsReducer(plugins)
  }
}

export const assertIndexContent = (
  { indexDocs, indexBlog, indexPages }: IndexFlags,
  { docsPlugins, blogPlugins, pagesPlugins }: CategorizedPlugins
) => {
  if (indexDocs && Object.keys(docsPlugins).length === 0) {
    throw new Error(
      'The "indexDocs" option is enabled but no docs plugin has been found.'
    )
  }
  if (indexBlog && Object.keys(blogPlugins).length === 0) {
    throw new Error(
      'The "indexBlog" option is enabled but no blog plugin has been found.'
    )
  }
  if (indexPages && Object(pagesPlugins).length) {
    throw new Error(
      'The "indexPages" option is enabled but no pages plugin has been found.'
    )
  }
}
