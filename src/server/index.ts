import { join, resolve } from 'path'
import { writeFile } from 'fs/promises'

import { retrieveTranslationMessages } from './translationMessages'
import { LoadContext, Plugin } from '@docusaurus/types'
import { create } from '@lyrasearch/lyra'
import { SectionSchema } from '../types'
import { ResolveSchema } from '@lyrasearch/lyra/dist/esm/src/types'
import { defaultHtmlSchema } from '@lyrasearch/plugin-parsedoc'
import { INDEX_FILE, PLUGIN_NAME } from '../shared'

const getThemePath = () => resolve(__dirname, '..', 'client', 'theme')
const docusaurusLyraSearchPlugin = (
  docusaurusContext: LoadContext
): Plugin => ({
  name: PLUGIN_NAME,
  getThemePath,
  getPathsToWatch() {
    return [getThemePath(), resolve(__dirname, '..', 'styles.module.css')]
  },
  getDefaultCodeTranslationMessages: async () => {
    return retrieveTranslationMessages(docusaurusContext)
  },
  async contentLoaded({ actions, allContent }) {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const index = await retrieveDevIndex(allContent)
    await actions.setGlobalData(index)
  },
  async postBuild({ outDir }) {
    const index = await retrieveIndex('**/*.html', pageRouteFactory)
    return writeIndex(outDir, index)
  }
})

// eslint-disable-next-line no-new-func
const importDynamic = new Function('modulePath', 'return import(modulePath)')

async function retrieveIndex(
  pattern: string,
  pageRouteFactory: (id: string) => string
): Promise<ResolveSchema<SectionSchema>[]> {
  const { defaultHtmlSchema, populateFromGlob } = await importDynamic(
    '@lyrasearch/plugin-parsedoc'
  )
  const db = create({ schema: defaultHtmlSchema })
  await populateFromGlob(db, pattern, {
    transformFn
  })

  return (Object.values(db.docs) as ResolveSchema<typeof defaultHtmlSchema>[])
    .map(node => defaultToSectionSchema(node, pageRouteFactory))
    .filter(isIndexable)
}

function transformFn(node: any) {
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

function defaultToSectionSchema(
  node: ResolveSchema<typeof defaultHtmlSchema>,
  pageRouteFactory: (id: string) => string
): ResolveSchema<SectionSchema> {
  const { id, content, type } = node
  const pageRoute = pageRouteFactory(id)
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

function pageRouteFactory(id: string) {
  return id.split('/').slice(1, -2).join('/')
}

function isIndexable(doc: ResolveSchema<SectionSchema>): boolean {
  return (
    !!doc.sectionContent &&
    !!doc.sectionTitle &&
    doc.type !== 'script' &&
    !doc.pageRoute.startsWith('/blogs/tags/')
  )
}

async function retrieveDevIndex(
  allContent: any
): Promise<ResolveSchema<SectionSchema>[]> {
  const index: ResolveSchema<SectionSchema>[] = []
  const indexGenerator = async ({
    permalink,
    source
  }: Record<string, string>) => {
    const pageRouteFactory = () => permalink.slice(1)

    return retrieveIndex(
      `**${source.slice(source.indexOf('/'))}`,
      pageRouteFactory
    )
  }

  const docs: Record<string, string>[] =
    allContent['docusaurus-plugin-content-docs']?.default?.loadedVersions[0]
      ?.docs ?? []

  const blogs: Record<string, string>[] =
    allContent['docusaurus-plugin-content-blog']?.default?.blogPosts?.map(
      ({ metadata }: any) => metadata
    ) ?? []

  const pages: Record<string, string>[] =
    allContent['docusaurus-plugin-content-pages']?.default ?? []

  index.push(
    ...(await Promise.all(docs.map(indexGenerator))).flat(),
    ...(await Promise.all(blogs.map(indexGenerator))).flat(),
    ...(await Promise.all(pages.map(indexGenerator))).flat()
  )

  return index
}
async function writeIndex(path: string, index: ResolveSchema<SectionSchema>[]) {
  return writeFile(join(path, INDEX_FILE), JSON.stringify(index))
}

export default docusaurusLyraSearchPlugin
