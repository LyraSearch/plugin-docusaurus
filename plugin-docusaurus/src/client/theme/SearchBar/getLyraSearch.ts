import { create, insertWithHooks } from '@lyrasearch/lyra'
import { ResolveSchema } from '@lyrasearch/lyra/dist/cjs/src/types'
import {
  afterInsert,
  LyraWithHighlight,
  SearchResultWithHighlight,
  searchWithHighlight
} from '@lyrasearch/plugin-match-highlight'
import { INDEX_FILE } from '../../../shared'
import { SectionSchema } from '../../../types'

let searchFn: (term: string) => SearchResultWithHighlight<SectionSchema>[]

export const getLyraSearch = async (baseUrl: string, indexData?: any) => {
  if (!searchFn) {
    indexData =
      indexData || (await (await fetch(`${baseUrl}${INDEX_FILE}`)).json())
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
    await Promise.all(
      indexData.map(async (record: ResolveSchema<SectionSchema>) => {
        record.pageRoute = `${baseUrl}${record.pageRoute}`
        return insertWithHooks(db, record)
      })
    )
    searchFn = (term: string) =>
      searchWithHighlight(db, { term, properties: '*' })
  }
  return searchFn
}
