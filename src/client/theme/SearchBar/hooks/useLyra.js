import { useState, useEffect } from 'react'
import { create, insert } from '@lyrasearch/lyra'
import useFetchIndex from './useFetchIndex'

const createLyraDB = () =>
  create({
    schema: {
      pageTitle: 'string',
      pageRoute: 'string',
      sectionRoute: 'string',
      sectionTitle: 'string',
      sectionContent: 'string',
      sectionTags: 'array',
      docusaurusTag: 'string'
    }
  })

const insertLyraRecord = lyraDb => record => insert(lyraDb, record)

const useLyra = ({ baseUrl }) => {
  const { index, isLoading } = useFetchIndex({ baseUrl })
  const [lyraDb, setLyraDb] = useState(undefined)

  useEffect(() => {
    if (!isLoading) {
      const lyraDb = createLyraDB()
      index.forEach(insertLyraRecord(lyraDb))
      setLyraDb(lyraDb)
    }
  }, [isLoading, index])

  return { lyraDb, isLoading }
}

export default useLyra
