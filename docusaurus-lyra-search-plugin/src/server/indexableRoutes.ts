import path from 'path'
import {
  CategorizedPlugins,
  IndexFlags,
  PluginAccumulator,
  PluginInfoWithFile,
  PluginInfoWithRoute,
  PluginType
} from './types'

type SkipRouteFunction = (
  path: string,
  route: string,
  tagsPath?: string
) => boolean

type ManageIndex = (
  docsPlugins: PluginAccumulator,
  route: string,
  url: string
) => PluginInfoWithRoute | PluginInfoWithRoute[]

const trimLeadingSlash = (path: string) => {
  if (!path || !path.startsWith('/')) {
    return path
  }
  return path.slice(1)
}

const trimTrailingSlash = (path: string): string => {
  if (!path || !path.endsWith('/')) {
    return path
  }
  return path.slice(0, -1)
}

const urlMatchesPrefix = (url: string, prefix: string) => {
  if (prefix.startsWith('/') || prefix.endsWith('/')) {
    throw new Error(`prefix must not start or end with a /.`)
  }
  return prefix === '' || url === prefix || url.startsWith(`${prefix}/`)
}

const assertBaseUrl = (url: string, baseUrl: string): void => {
  if (!url.startsWith(baseUrl)) {
    throw new Error(`The route must start with the baseUrl ${baseUrl}.`)
  }
}

const isDocusaurusPage: SkipRouteFunction = (route, basePath) =>
  urlMatchesPrefix(route, trimLeadingSlash(`${basePath}/__docusaurus`))

const isDebugPluginPage: SkipRouteFunction = (route, basePath, tagsPath) =>
  urlMatchesPrefix(route, trimLeadingSlash(`${basePath}/${tagsPath}`)) ||
  isDocusaurusPage(route, basePath)

const isDebugOrSelfPage: SkipRouteFunction = (route, basePath, tagsPath) =>
  route === basePath || isDebugPluginPage(route, basePath, tagsPath)

const manageDocs = (
  plugins: PluginAccumulator,
  route: string,
  url: string,
  skipRouteFunction: SkipRouteFunction,
  type: PluginType
): PluginInfoWithRoute | PluginInfoWithRoute[] => {
  for (const plugin of Object.values(plugins)) {
    const basePath = trimTrailingSlash(plugin.options.routeBasePath as string)
    const tagsPath = plugin.options.tagsBasePath as string

    if (urlMatchesPrefix(route, basePath)) {
      const skipRoute = skipRouteFunction(route, basePath, tagsPath)
      return skipRoute
        ? []
        : {
            route,
            url,
            type
          }
    }
  }
  return []
}

const manageIndexDocs: ManageIndex = (docsPlugins, route, url) =>
  manageDocs(docsPlugins, route, url, isDebugPluginPage, PluginType.docs)

const manageIndexBlog: ManageIndex = (blogPlugins, route, url) =>
  manageDocs(blogPlugins, route, url, isDebugOrSelfPage, PluginType.blog)

const manageIndexPages: ManageIndex = (pagesPlugins, route, url) =>
  manageDocs(pagesPlugins, route, url, isDocusaurusPage, PluginType.page)

export const retrieveIndexableRoutes =
  (
    baseUrl: string,
    { docsPlugins, blogPlugins, pagesPlugins }: CategorizedPlugins,
    { indexDocs, indexBlog, indexPages }: IndexFlags
  ) =>
  (url: string) => {
    assertBaseUrl(url, baseUrl)

    const route = url.substring(baseUrl.length)

    if (route === '404.html') {
      return []
    }
    if (indexDocs) {
      const managedDoc = manageIndexDocs(docsPlugins, route, url)
      if (managedDoc) return managedDoc
    }
    if (indexBlog) {
      const managedBlog = manageIndexBlog(blogPlugins, route, url)
      if (managedBlog) return managedBlog
    }
    if (indexPages) {
      const managedPage = manageIndexPages(pagesPlugins, route, url)
      if (managedPage) return managedPage
    }

    return []
  }

export const mapRouteToIndex =
  (outDir: string) =>
  ({ route, url, type }: PluginInfoWithRoute): PluginInfoWithFile => {
    const file = path.join(outDir, route, 'index.html')
    return {
      file,
      url,
      type
    }
  }
