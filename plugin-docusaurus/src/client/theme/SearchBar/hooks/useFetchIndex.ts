import { useEffect, useState } from 'react'

const SEARCH_INDEX_AVAILABLE = process.env.NODE_ENV === 'production'

const useFetchIndex = ({ baseUrl }: { baseUrl: string }) => {
  const [index, setIndex] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (SEARCH_INDEX_AVAILABLE) {
      setIsLoading(true)
      fetch(`${baseUrl}lyra-search-index.json`)
        .then(result => result.json())
        .catch(() => {
          console.error("plugin-docusaurus: couldn't fetch index")
          return []
        })
        .then(setIndex)
        .finally(() => setIsLoading(false))
    }
  }, [baseUrl])

  return { index, isLoading }
}

export default useFetchIndex
