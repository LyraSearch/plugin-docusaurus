import { join, resolve } from 'path'
import { readFile, writeFile } from 'fs/promises'

import { PluginOptions, validateOptions } from './pluginOptions'
import logger from './logger'
import {
  retrieveDocusaurusPluginsContent
  // assertIndexContent
} from './docusaurusPluginsContent'
import { retrieveTranslationMessages } from './translationMessages'
import { retrieveIndexableRoutes, mapRouteToIndex } from './indexableRoutes'
import { html2text, getDocusaurusTag } from './parseUtils'
import { LoadContext, Plugin } from '@docusaurus/types'
import { PluginInfoWithFile } from './types'

const PLUGIN_NAME = '@lyrasearch/docusaurus-lyra-search-plugin'
const generateReadPromises = async ({
  file,
  url,
  type
}: PluginInfoWithFile) => {
  logger.debug(`Parsing ${type} file ${file}`, { url })
  const html = await readFile(file, { encoding: 'utf8' })
  const { pageTitle, sections /*, docSidebarParentCategories */ } = html2text(
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
    // sectionTags: section.tags, TODO lyra doesn't support arrays
    docusaurusTag,
    // docSidebarParentCategories,
    type
  }))
}

const docusaurusLyraSearchPlugin = (
  docusaurusContext: LoadContext,
  pluginOptions: Partial<PluginOptions>
): Plugin => {
  const options = validateOptions(pluginOptions)
  const { indexDocSidebarParentCategories, maxSearchResults, ...indexFlags } =
    options

  return {
    name: PLUGIN_NAME,
    getThemePath() {
      return resolve(__dirname, '..', 'client', 'theme')
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
      logger.info(baseUrl)

      const pluginsContent = retrieveDocusaurusPluginsContent(plugins)

      // assertIndexContent(indexFlags, pluginsContent)

      const data = routesPaths
        .flatMap(retrieveIndexableRoutes(baseUrl, pluginsContent, indexFlags))
        .map(mapRouteToIndex(outDir))

      logger.info('Documents retrieved, started index build...')

      const indexContent = (
        await Promise.all(data.map(generateReadPromises))
      ).flat()

      writeFile(
        join(outDir, 'lyra-search-index.json'),
        JSON.stringify(indexContent)
      )
    }
  }
}

export default docusaurusLyraSearchPlugin
