import { create, insert, search } from '@lyrasearch/lyra'

let searchFn

export const getLyraSearch = async baseUrl => {
  if (!searchFn) {
    const indexData = await fetch(`${baseUrl}lyra-search-index.json`).then(
      result => result.json()
    )
    const db = create({
      schema: {
        pageTitle: 'string',
        pageRoute: 'string',
        sectionRoute: 'string',
        sectionTitle: 'string',
        sectionContent: 'string',
        // sectionTags: 'array', TODO lyra doesn't support arrays
        docusaurusTag: 'string',
        type: 'string'
      }
    })
    indexData.forEach(record => insert(db, record))
    searchFn = term => search(db, { term, properties: '*' })
  }
  return searchFn
}
