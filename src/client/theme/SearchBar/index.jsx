import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useFetchIndex from './hooks/useFetchIndex'

const SearchBar = () => {
  const { siteConfig } = useDocusaurusContext()

  const { index, isLoading } = useFetchIndex(siteConfig)

  console.log(index, isLoading)
}

export default SearchBar
