const { join, resolve } = require('path')
const { readFile, writeFile } = require('fs/promises')

const { validateOptions } = require('./pluginOptions')
const logger = require('./logger')
const {
  retrieveDocusaurusPluginsContent,
  assertIndexContent
} = require('./docusaurusPluginsContent')
const { retrieveTranslationMessages } = require('./translationMessages')
const {
  retrieveIndexableRoutes,
  mapRouteToIndex
} = require('./indexableRoutes')
const { html2text, getDocusaurusTag } = require('./parseUtils')

const generateReadPromises = async ({ file, url, type }) => {
  logger.debug(`Parsing ${type} file ${file}`, { url })
  const html = await readFile(file, { encoding: 'utf8' })
  const { pageTitle, sections, docSidebarParentCategories } = html2text(
    html,
    type,
    url
  )
  const docusaurusTag = getDocusaurusTag(html)

  return sections.map(section => ({
    pageTitle,
    pageRoute: url,
    sectionRoute: url + section.hash,
    sectionTitle: section.title,
    sectionContent: section.content,
    sectionTags: section.tags,
    docusaurusTag,
    docSidebarParentCategories,
    type
  }))
}

const docusaurusLyraSearchPlugin = (docusaurusContext, pluginOptions) => {
  pluginOptions = validateOptions(pluginOptions)

  const {
    indexDocs,
    indexBlog,
    indexPages,
    indexDocSidebarParentCategories,
    maxSearchResults
  } = pluginOptions

  return {
    name: 'docusaurus-lyra-search-plugin',
    getThemePath() {
      return resolve(__dirname, '..', 'client', 'theme')
    },
    getTypeScriptThemePath() {
      return undefined
    },
    getDefaultCodeTranslationMessages: async () => {
      return retrieveTranslationMessages(docusaurusContext)
    },
    async contentLoaded({ actions: { setGlobalData } }) {
      const data = {
        indexDocSidebarParentCategories,
        maxSearchResults
      }
      setGlobalData({ data })
    },
    async postBuild({ routesPaths = [], outDir, baseUrl, plugins }) {
      logger.info('Retrieving documents')

      const indexFlags = { indexDocs, indexBlog, indexPages }
      const pluginsContent = retrieveDocusaurusPluginsContent(plugins)

      assertIndexContent(indexFlags, pluginsContent)

      const data = routesPaths
        .flatMap(retrieveIndexableRoutes(baseUrl, pluginsContent, indexFlags))
        .map(mapRouteToIndex(outDir))

      logger.info('Documents retrieved, started index build...')

      const indexContent = (
        await Promise.all(data.map(generateReadPromises))
      ).flat()

      await writeFile(
        join(outDir, 'lyra-search-index.json'),
        JSON.stringify(indexContent)
      )
    }
  }
}

module.exports = docusaurusLyraSearchPlugin
