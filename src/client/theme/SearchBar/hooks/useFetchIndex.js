import { useEffect, useState } from 'react'

const SEARCH_INDEX_AVAILABLE = process.env.NODE_ENV === 'production'

const useFetchIndex = ({ baseUrl }) => {
  const [index, setIndex] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (SEARCH_INDEX_AVAILABLE) {
      setIsLoading(true)
      fetch(`${baseUrl}lyra-search-index.json`)
        .then(result => result.json())
        .catch([])
        .then(setIndex)
        .finally(() => setIsLoading(false))
    }
  }, [baseUrl])

  return { index, isLoading }
}

export default useFetchIndex
