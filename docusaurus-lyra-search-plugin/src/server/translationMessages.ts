import path from 'path'
import fs from 'fs'
import { LoadContext } from '@docusaurus/types'

function codeTranslationLocalesToTry(locale: string) {
  const intlLocale = new Intl.Locale(locale)
  const maximizedLocale = intlLocale.maximize()
  return [
    locale,
    `${maximizedLocale.language}-${maximizedLocale.region}`,
    `${maximizedLocale.language}-${maximizedLocale.script}`,
    maximizedLocale.language
  ]
}

const retrieveObjectContent = async (filePath: string) => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8')
  return JSON.parse(fileContent)
}

export const retrieveTranslationMessages = async (
  docusaurusContext: LoadContext
) => {
  const translationsDir = path.resolve(
    __dirname,
    '..',
    '..',
    'translationMessages'
  )
  const localesToTry = codeTranslationLocalesToTry(
    docusaurusContext.i18n.currentLocale
  )

  const existingLocalePath = localesToTry
    .map(locale => path.join(translationsDir, `${locale}.json`))
    .find(fs.existsSync)

  return existingLocalePath
    ? retrieveObjectContent(existingLocalePath)
    : Promise.resolve({})
}
