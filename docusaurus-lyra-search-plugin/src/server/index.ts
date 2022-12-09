import { join, resolve } from 'path'
import { writeFile } from 'fs/promises'

import { retrieveTranslationMessages } from './translationMessages'
import { LoadContext, Plugin } from '@docusaurus/types'
import { create } from '@lyrasearch/lyra'
import { SectionSchema } from '../types'
import { ResolveSchema } from '@lyrasearch/lyra/dist/esm/src/types'
import { defaultHtmlSchema } from '@lyrasearch/plugin-parsedoc'

const PLUGIN_NAME = '@lyrasearch/docusaurus-lyra-search-plugin'
const docusaurusLyraSearchPlugin = (
  docusaurusContext: LoadContext
): Plugin => ({
  name: PLUGIN_NAME,
  getThemePath() {
    return resolve(__dirname, '..', 'client', 'theme')
  },
  getDefaultCodeTranslationMessages: async () => {
    return retrieveTranslationMessages(docusaurusContext)
  },
  async postBuild({ outDir, baseUrl }) {
    const index = await retrieveIndex(baseUrl)
    return writeIndex(outDir, index)
  }
})

const importDynamic = new Function('modulePath', 'return import(modulePath)')

async function retrieveIndex(
  baseUrl: string
): Promise<ResolveSchema<SectionSchema>[]> {
  const { defaultHtmlSchema, populateFromGlob } = await importDynamic(
    '@lyrasearch/plugin-parsedoc'
  )
  const db = create({ schema: defaultHtmlSchema })
  await populateFromGlob(db, '**/*.html', {
    transformFn: (node: any) => {
      switch (node.tag) {
        case 'strong':
        case 'a':
        case 'time':
        case 'code':
        case 'span':
        case 'small':
        case 'b':
        case 'p':
        case 'ul':
          return { ...node, raw: `<p>${node.content}</p>` }
        default:
          return node
      }
    }
  })

  return (Object.values(db.docs) as ResolveSchema<typeof defaultHtmlSchema>[])
    .map(node => defaultToSectionSchema(node, baseUrl))
    .filter(isIndexable)
}

function defaultToSectionSchema(
  node: ResolveSchema<typeof defaultHtmlSchema>,
  baseUrl: string
): ResolveSchema<SectionSchema> {
  const { id, content, type } = node
  const pageRoute = `${baseUrl}${id.split('/').slice(1, -2).join('/')}`
  const sectionTitle = (pageRoute.split('/').pop() ?? '')
    .replace(/(-)+/g, ' ')
    .split(' ')
    .map(word => word && `${word[0].toUpperCase()}${word.substring(1)}`)
    .join(' ')

  return {
    pageRoute,
    sectionTitle,
    sectionContent: content,
    type
  }
}

function isIndexable(doc: ResolveSchema<SectionSchema>): boolean {
  return (
    !!doc.sectionContent &&
    !!doc.sectionTitle &&
    doc.type !== 'script' &&
    !doc.pageRoute.startsWith('/blogs/tags/')
  )
}

async function writeIndex(path: string, index: ResolveSchema<SectionSchema>[]) {
  return writeFile(join(path, 'lyra-search-index.json'), JSON.stringify(index))
}

export default docusaurusLyraSearchPlugin
