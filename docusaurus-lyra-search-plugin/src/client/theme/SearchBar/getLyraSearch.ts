import {
  create,
  insert,
  PropertiesSchema,
  search,
  SearchResult
} from '@lyrasearch/lyra'
import { ResolveSchema } from '@lyrasearch/lyra/dist/esm/src/types'

export interface SectionSchema extends PropertiesSchema {
  pageTitle: 'string'
  pageRoute: 'string'
  sectionRoute: 'string'
  sectionTitle: 'string'
  sectionContent: 'string'
  docusaurusTag: 'string'
  type: 'string'
}

let searchFn: (term: string) => SearchResult<SectionSchema>

export const getLyraSearch = async (baseUrl: string) => {
  if (!searchFn) {
    const indexData = await fetch(`${baseUrl}lyra-search-index.json`).then(
      result => result.json()
    )
    const db = create<SectionSchema>({
      schema: {
        pageTitle: 'string',
        pageRoute: 'string',
        sectionRoute: 'string',
        sectionTitle: 'string',
        sectionContent: 'string',
        docusaurusTag: 'string',
        type: 'string'
      }
    })
    indexData.forEach((record: ResolveSchema<SectionSchema>) =>
      insert(db, record)
    )
    searchFn = (term: string) => search(db, { term, properties: '*' })
  }
  return searchFn
}
