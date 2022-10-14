import path from 'path'
import { readFile, writeFile } from 'fs/promises'

import { validateOptions } from './pluginOptions'
import { name } from '../../package.json'
import logger from './logger'
import {
  retrieveDocusaurusPluginsContent,
  assertIndexContent
} from './docusaurusPluginsContent'
import { retrieveTranslationMessages } from './translationMessages'
import { retrieveIndexableRoutes, mapRouteToIndex } from './indexableRoutes'
import { html2text, getDocusaurusTag } from './parseUtils'

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
  validateOptions(pluginOptions)

  const {
    indexDocs,
    indexBlog,
    indexPages,
    indexDocSidebarParentCategories,
    maxSearchResults
  } = pluginOptions

  return {
    name,
    getThemePath() {
      return path.resolve(__dirname, '..', 'client', 'theme')
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
    async postBuild({
      routesPaths = [],
      outDir,
      baseUrl,
      siteConfig: { trailingSlash },
      plugins
    }) {
      logger.info('Retrieving documents')

      const indexFlags = { indexDocs, indexBlog, indexPages }
      const pluginsContent = retrieveDocusaurusPluginsContent(plugins)

      assertIndexContent(indexFlags, pluginsContent)

      const data = routesPaths
        .flatMap(retrieveIndexableRoutes(baseUrl, pluginsContent, indexFlags))
        .map(mapRouteToIndex(trailingSlash, outDir))

      logger.info('Documents retrieved, started index build...')

      const documents = (
        await Promise.all(data.map(generateReadPromises))
      ).flat()

      await writeFile('./test.json', JSON.stringify(documents))
    }
  }
}

export default docusaurusLyraSearchPlugin
