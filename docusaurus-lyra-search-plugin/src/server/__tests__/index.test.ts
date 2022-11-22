import docusaurusLyraSearchPlugin from '..'
import { readFile } from 'fs/promises'

const plugins: any[] = [
  {
    name: 'docusaurus-plugin-content-docs',
    options: {
      routeBasePath: 'docs',
      tagsBasePath: 'tags',
      docItemComponent: '@theme/DocItem'
    }
  }
]

const routesPaths = ['/docs/two-sections', '/']

describe('create index for lyra', () => {
  it('should index the content by sections', async () => {
    expect.hasAssertions()

    const plugin = docusaurusLyraSearchPlugin({} as any, {})
    await plugin.postBuild!({
      plugins,
      routesPaths,
      outDir: './src/server/__fixtures__',
      baseUrl: '/'
    } as any)

    const content = JSON.parse(
      await readFile(`${__dirname}/../__fixtures__/lyra-search-index.json`, {
        encoding: 'utf-8'
      })
    )

    expect(content).toHaveLength(2)
  })
})
