import { LoadedPlugin } from '@docusaurus/types'

export type PluginAccumulator = {
  [id: string]: LoadedPlugin
}

type PluginInfo = {
  url: string
  type: PluginType
}

export type PluginInfoWithRoute = PluginInfo & {
  route: string
}

export type PluginInfoWithFile = PluginInfo & {
  file: string
}

export type CategorizedPlugins = {
  docsPlugins: PluginAccumulator
  blogPlugins: PluginAccumulator
  pagesPlugins: PluginAccumulator
}

export type IndexFlags = {
  indexDocs: boolean
  indexBlog: boolean
  indexPages: boolean
}

export enum PluginType {
  docs = 'docs',
  blog = 'blog',
  page = 'page'
}
