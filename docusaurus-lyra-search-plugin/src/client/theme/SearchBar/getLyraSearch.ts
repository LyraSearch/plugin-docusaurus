import { create, insertWithHooks } from '@lyrasearch/lyra'
import { ResolveSchema } from '@lyrasearch/lyra/dist/cjs/src/types'
import {
  afterInsert,
  LyraWithHighlight,
  SearchResultWithHighlight,
  searchWithHighlight
} from '@lyrasearch/plugin-match-highlight'
import { SectionSchema } from '../../../types'

let searchFn: (term: string) => SearchResultWithHighlight<SectionSchema>[]

export const getLyraSearch = async (baseUrl: string) => {
  if (!searchFn) {
    const indexData = await (
      await fetch(`${baseUrl}lyra-search-index.json`)
    ).json()
    const db = create<SectionSchema>({
      schema: {
        pageRoute: 'string',
        sectionTitle: 'string',
        sectionContent: 'string',
        type: 'string'
      },
      hooks: {
        afterInsert
      }
    }) as LyraWithHighlight<SectionSchema>
    indexData.forEach((record: ResolveSchema<SectionSchema>) =>
      insertWithHooks(db, record)
    )
    searchFn = (term: string) =>
      searchWithHighlight(db, { term, properties: '*' })
  }
  return searchFn
}
