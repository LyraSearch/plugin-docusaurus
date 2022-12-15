import {
  autocomplete,
  AutocompleteComponents,
  Render
} from '@algolia/autocomplete-js'
import '@algolia/autocomplete-theme-classic/dist/theme.min.css'
import React, { createElement, Fragment, useEffect, useRef } from 'react'
import { render } from 'react-dom'
import useIsBrowser from '@docusaurus/useIsBrowser'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { getLyraSearch } from './getLyraSearch'
import { ResolveSchema } from '@lyrasearch/lyra/dist/esm/src/types'
import { SectionSchema } from '../../../types'
import { useColorMode } from '@docusaurus/theme-common'
import { Footer } from './Footer'
import '../../../../search.css'

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
            </div>
            <div className="aa-ItemContentDescription">
              <components.Snippet hit={item} attribute="sectionContent" />
            </div>
          </div>
        </div>
      </a>
    )
  }
}

function renderNotEnabledMessage(
  { render }: { render: Render },
  root: HTMLElement
) {
  render(
    <>
      <div className="aa-PanelLayout aa-Panel--scrollable">
        No search data available, lyra search is only available on production
        builds.
      </div>
      <Footer />
    </>,
    root
  )
}

export default function SearchBar() {
  const isBrowser = useIsBrowser()
  const { siteConfig } = useDocusaurusContext()
  const containerRef = useRef(null)
  const { colorMode } = useColorMode()

  useEffect(() => {
    if (!containerRef.current || !isBrowser) {
      return undefined
    }

    const search = autocomplete({
      container: containerRef.current,
      // @ts-expect-error render typing here is for preact, react also works
      renderer: { createElement, Fragment, render },
      openOnFocus: true,
      detachedMediaQuery: '', // always detached
      async getSources({ query }): Promise<any> {
        try {
          const lyraSearch = await getLyraSearch(siteConfig.baseUrl)

          return [
            {
              sourceId: 'lyra',
              getItems() {
                const results = lyraSearch(query)
                return results.hits.map(hit => hit.document)
              },
              getItemUrl({ item }: { item: ResolveSchema<SectionSchema> }) {
                return item.pageRoute
              },
              templates
            }
          ]
        } catch (e) {
          // won't work in dev build mode, TODO a better error message here?
          return []
        }
      },
      render({ sections, render }, root) {
        render(
          <>
            <div className="aa-PanelLayout aa-Panel--scrollable">
              {sections}
            </div>
            <Footer />
          </>,
          root
        )
      },
      renderNoResults:
        process.env.NODE_ENV === 'production'
          ? undefined
          : renderNotEnabledMessage
    })
    return () => {
      search.destroy()
    }
  }, [isBrowser, siteConfig])

  useEffect(() => {
    colorMode === 'dark'
      ? document.body.classList.add(colorMode)
      : document.body.classList.remove('dark')
  }, [colorMode])

  return <div ref={containerRef} />
}
