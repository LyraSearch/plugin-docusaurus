import { autocomplete, AutocompleteComponents } from '@algolia/autocomplete-js'

import '@algolia/autocomplete-theme-classic/dist/theme.min.css'

import React, { createElement, Fragment, useEffect, useRef } from 'react'
import { render } from 'react-dom'
import useIsBrowser from '@docusaurus/useIsBrowser'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { getLyraSearch, SectionSchema } from './getLyraSearch'
import { ResolveSchema } from '@lyrasearch/lyra/dist/esm/src/types'

// components.Snippet just truncates here, it doesn't actually truncate to the content near the hit
const templates = {
  item({
    item,
    components
  }: {
    item: ResolveSchema<SectionSchema>
    components: AutocompleteComponents
  }) {
    return (
      <a className="aa-ItemLink" href={item.pageRoute}>
        <div className="aa-ItemContent">
          <div className="aa-ItemContentBody">
            <div className="aa-ItemContentTitle">
              <h5 style={{ marginBottom: 0 }}>{item.sectionTitle}</h5>
              <components.Snippet hit={item} attribute="sectionContent" />
            </div>
          </div>
        </div>
      </a>
    )
  }
}

export default function SearchBar() {
  const isBrowser = useIsBrowser()
  const { siteConfig } = useDocusaurusContext()
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !isBrowser) {
      return undefined
    }

    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment },
      render({ children }, root) {
        render(children as any, root)
      },
      openOnFocus: true,
      detachedMediaQuery: '',
      async getSources({ query }): Promise<any> {
        const search = await getLyraSearch(siteConfig.baseUrl)
        return [
          {
            sourceId: 'lyra',
            getItems() {
              const results = search(query)
              console.log(results)
              return results.hits.map(hit => hit.document)
            },
            getItemUrl({ item }: { item: ResolveSchema<SectionSchema> }) {
              return item.pageRoute
            },
            templates
          }
        ]
      }
    })

    return () => {
      search.destroy()
    }
  }, [isBrowser, siteConfig])

  return <div ref={containerRef} />
}
