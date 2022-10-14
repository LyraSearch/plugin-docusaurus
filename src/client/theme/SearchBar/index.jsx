import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useLyra from './hooks/useLyra'

const SearchBar = () => {
  const { siteConfig } = useDocusaurusContext()

  const { lyraDb, isLoading } = useLyra(siteConfig)

  console.log(lyraDb, isLoading)

  return 'Here will be placed the search bar'
}

export default SearchBar
