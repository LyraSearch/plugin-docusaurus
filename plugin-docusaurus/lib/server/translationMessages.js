"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTranslationMessages = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
function codeTranslationLocalesToTry(locale) {
    const intlLocale = new Intl.Locale(locale);
    const maximizedLocale = intlLocale.maximize();
    return [
        locale,
        `${maximizedLocale.language}-${maximizedLocale.region}`,
        `${maximizedLocale.language}-${maximizedLocale.script}`,
        maximizedLocale.language
    ];
}
const retrieveObjectContent = async (filePath) => {
    const fileContent = await fs_1.default.promises.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
};
const retrieveTranslationMessages = async (docusaurusContext) => {
    const translationsDir = path_1.default.resolve(__dirname, '..', '..', 'translationMessages');
    const localesToTry = codeTranslationLocalesToTry(docusaurusContext.i18n.currentLocale);
    const existingLocalePath = localesToTry
        .map(locale => path_1.default.join(translationsDir, `${locale}.json`))
        .find(fs_1.default.existsSync);
    return existingLocalePath
        ? retrieveObjectContent(existingLocalePath)
        : Promise.resolve({});
};
exports.retrieveTranslationMessages = retrieveTranslationMessages;
