const path = require('path')
const fs = require('fs')

function codeTranslationLocalesToTry(locale) {
  const intlLocale = new Intl.Locale(locale)
  const maximizedLocale = intlLocale.maximize()
  return [
    locale,
    `${maximizedLocale.language}-${maximizedLocale.region}`,
    `${maximizedLocale.language}-${maximizedLocale.script}`,
    maximizedLocale.language
  ]
}

const retrieveObjectContent = async filePath => {
  const fileContent = await fs.promises.readFile(filePath, 'utf8')
  return JSON.parse(fileContent)
}

const retrieveTranslationMessages = async docusaurusContext => {
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

module.exports = {
  retrieveTranslationMessages
}
