import { AnyNode, Cheerio, Element, CheerioAPI, load } from 'cheerio'
import { ElementType } from 'domelementtype'
import logger from './logger'
import { PluginType } from './types'

type SectionData = {
  title: string
  hash: string
  content: string
  tags: string[]
}

type PageInfo = {
  pageTitle: string
  sections: SectionData[]
  docSidebarParentCategories?: string[]
}

const BLOCK_TAGS = [
  'address',
  'article',
  'aside',
  'blockquote',
  'canvas',
  'dd',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'noscript',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tfoot',
  'ul',
  'video',
  'td',
  'th'
]

const MULTIPLE_SPACES_REGEX = /\s+/g

const HEADINGS = 'h1, h2, h3'

function _getText($: CheerioAPI, el: AnyNode[] | AnyNode): string {
  if (Array.isArray(el)) {
    let content = ''
    el.forEach(el => {
      content += _getText($, el)
      if (
        el.type === ElementType.Tag &&
        (BLOCK_TAGS.includes(el.name) ||
          // for lines in code blocks
          (el.name === 'span' && $(el).attr('class') === 'token-line'))
      ) {
        content += ' '
      }
    })
    return content
  } else if (el.type === ElementType.Text) {
    return el.data.replace(/\n/g, ' ')
  } else if (el.type === ElementType.Tag) {
    return _getText($, $(el).contents().get())
  } else if (
    [ElementType.Style, ElementType.Script, ElementType.Comment].includes(
      el.type
    )
  ) {
    return ''
  } else {
    logger.warn(
      'Received an unknown element while extracting content from HTML files.'
    )
    return ''
  }
}

function getText($: CheerioAPI, el: AnyNode[]) {
  return _getText($, el).replace(MULTIPLE_SPACES_REGEX, ' ').trim()
}

const removeVersionBadges = (cheerioInstance: CheerioAPI): void => {
  cheerioInstance('span')
    .filter(
      (_, element) =>
        cheerioInstance(element).hasClass('badge') &&
        cheerioInstance(element).text().startsWith('Version:')
    )
    .remove()
}

const retrieveTags = (cheerioInstance: CheerioAPI) =>
  cheerioInstance('article footer ul[class^=tags_] li')
    .map((_, element) => cheerioInstance(element).text())
    .toArray()

const COPY_BUTTOINS_SELECTOR = 'div[class^=codeBlockContent_] button'
const PAGE_TITLE_SELECTOR = 'article header h1'
const HASH_LINK_SELECTOR = 'a.hash-link'
const ARIA_SELECTOR = 'a[aria-hidden=true]'
const ARIA_OR_HASHLINK_SELECTOR = `${ARIA_SELECTOR}, ${HASH_LINK_SELECTOR}`
const SIDEBAR_PARENT_SELECTOR =
  '.theme-doc-sidebar-container .menu__link--active'

const warnMainElement = (mainElement: Cheerio<Element>, url: string) => {
  if (!mainElement.length) {
    logger.warn(
      'Page has no <main>, therefore no content was indexed for this page.',
      { url }
    )
  }
}

const manageTypePage = (cheerioInstance: CheerioAPI, url: string): PageInfo => {
  cheerioInstance(ARIA_SELECTOR).remove()
  let pageTitleElement = cheerioInstance('h1').first()
  if (!pageTitleElement.length) {
    pageTitleElement = cheerioInstance('title')
  }

  const pageTitle = pageTitleElement.text()
  const mainElement = cheerioInstance('main').first()

  warnMainElement(mainElement, url)

  return {
    pageTitle,
    sections: [
      {
        title: pageTitle,
        hash: '',
        content: mainElement.length
          ? getText(cheerioInstance, mainElement.get())
          : '',
        tags: []
      }
    ]
  }
}

const manageDocsOrBlogType = (
  cheerioInstance: CheerioAPI,
  type: PluginType
): PageInfo => {
  const pageTitle = cheerioInstance(PAGE_TITLE_SELECTOR).first().text()

  const sections: SectionData[] = []
  const tags = retrieveTags(cheerioInstance)

  cheerioInstance('article')
    .find(HEADINGS)
    .each((i, heading) => {
      const title = cheerioInstance(heading)
        .contents()
        .not(ARIA_OR_HASHLINK_SELECTOR)
        .text()
      const hash =
        cheerioInstance(heading).find(HASH_LINK_SELECTOR).attr('href') || ''

      let $sectionElements
      if (cheerioInstance(heading).parents('.markdown').length === 0) {
        // $(heading) is the page title

        const firstArticleElement = cheerioInstance('article')
          .children()
          .not('header')
          .children()
          .first()
        if (firstArticleElement.filter(HEADINGS).length) {
          sections.push({
            title,
            hash,
            content: '',
            tags: i === 0 ? tags : []
          })
          return
        }
        $sectionElements = firstArticleElement
          .nextUntil(`${HEADINGS}, header`)
          .addBack()
      } else {
        const root = cheerioInstance(heading).parent('header').length
          ? cheerioInstance(heading).parent()
          : cheerioInstance(heading)
        $sectionElements = root.nextUntil(`${HEADINGS}, header`)
      }
      const content = getText(cheerioInstance, $sectionElements.get())

      sections.push({
        title,
        hash,
        content,
        tags: i === 0 ? tags : []
      })
    })

  const docSidebarParentCategories =
    type === 'docs'
      ? cheerioInstance(SIDEBAR_PARENT_SELECTOR)
          .map((_, element) => cheerioInstance(element).text())
          .get()
          .slice(0, -1)
      : undefined

  return { pageTitle, sections, docSidebarParentCategories }
}

export const html2text = (
  html: string,
  type: PluginType,
  url: string = '?'
) => {
  const cheerioInstance = load(html)
  // Remove copy buttons from code boxes
  cheerioInstance(COPY_BUTTOINS_SELECTOR).remove()

  if (type === 'docs') {
    removeVersionBadges(cheerioInstance)
  }
  if (type === 'docs' || type === 'blog') {
    return manageDocsOrBlogType(cheerioInstance, type)
  } else if (type === 'page') {
    return manageTypePage(cheerioInstance, url)
  } else {
    throw new Error(`Cannot index files of unknown type ${type}!`)
  }
}

const assertTagPresence = (tag?: string) => {
  if (!tag || tag.length === 0) {
    throw new Error('The `docusaurus_tag` meta tag could not be found.')
  }
}

export const getDocusaurusTag = (html: string) => {
  const $ = load(html)
  const tag = $('meta[name="docusaurus_tag"]').attr('content')
  assertTagPresence(tag)
  return tag
}
