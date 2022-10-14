const path = require('path')

const trimLeadingSlash = path => {
  if (!path || !path.startsWith('/')) {
    return path
  }
  return path.slice(1)
}

const trimTrailingSlash = path => {
  if (!path || !path.endsWith('/')) {
    return path
  }
  return path.slice(0, -1)
}

const urlMatchesPrefix = (url, prefix) => {
  if (prefix.startsWith('/') || prefix.endsWith('/')) {
    throw new Error(`prefix must not start or end with a /.`)
  }
  return prefix === '' || url === prefix || url.startsWith(`${prefix}/`)
}

const assertBaseUrl = (url, baseUrl) => {
  if (!url.startsWith(baseUrl)) {
    throw new Error(`The route must start with the baseUrl ${baseUrl}.`)
  }
}

const isDocusaurusPage = (route, basePath) =>
  urlMatchesPrefix(route, trimLeadingSlash(`${basePath}/__docusaurus`))

const isDebugPluginPage = (route, basePath, tagsPath) =>
  urlMatchesPrefix(route, trimLeadingSlash(`${basePath}/${tagsPath}`)) ||
  isDocusaurusPage(route, basePath)

const isDebugOrSelfPage = (route, basePath, tagsPath) =>
  route === basePath || isDebugPluginPage(route, basePath, tagsPath)

const manageDocs = (plugins, route, url, skipRouteFunction, type) => {
  for (const plugin of plugins.values()) {
    const basePath = trimTrailingSlash(plugin.options.routeBasePath)
    const tagsPath = plugin.options.tagsBasePath

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
}

const manageIndexDocs = (docsPlugins, route, url) => {
  return manageDocs(docsPlugins, route, url, isDebugPluginPage, 'docs')
}

const manageIndexBlog = (blogPlugins, route, url) => {
  return manageDocs(blogPlugins, route, url, isDebugOrSelfPage, 'blog')
}

const managePagesBlog = (pagesPlugins, route, url) => {
  return manageDocs(pagesPlugins, route, url, isDocusaurusPage, 'page')
}

const retrieveIndexableRoutes =
  (
    baseUrl,
    { docsPlugins, blogPlugins, pagesPlugins },
    { indexDocs, indexBlog, indexPages }
  ) =>
  url => {
    assertBaseUrl(url, baseUrl)

    const route = url.substring(baseUrl.length)

    if (route === '404.html') {
      return []
    }
    if (indexDocs) {
      return manageIndexDocs(docsPlugins, route, url)
    }
    if (indexBlog) {
      return manageIndexBlog(blogPlugins, route, url)
    }
    if (indexPages) {
      return managePagesBlog(pagesPlugins, route, url)
    }

    return []
  }

const mapRouteToIndex =
  (trailingSlash, outDir) =>
  ({ route, url, type }) => {
    const file = !trailingSlash
      ? path.join(outDir, `${route || 'index'}.html`)
      : path.join(outDir, route, 'index.html')
    return {
      file,
      url,
      type
    }
  }

module.exports = {
  retrieveIndexableRoutes,
  mapRouteToIndex
}
