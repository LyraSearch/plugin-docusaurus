"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const promises_1 = require("fs/promises");
const translationMessages_1 = require("./translationMessages");
const lyra_1 = require("@lyrasearch/lyra");
const PLUGIN_NAME = '@lyrasearch/plugin-docusaurus';
const getThemePath = () => (0, path_1.resolve)(__dirname, '..', 'client', 'theme');
const docusaurusLyraSearchPlugin = (docusaurusContext) => ({
    name: PLUGIN_NAME,
    getThemePath,
    getPathsToWatch() {
        return [getThemePath(), (0, path_1.resolve)(__dirname, '..', 'styles.module.css')];
    },
    getDefaultCodeTranslationMessages: async () => {
        return (0, translationMessages_1.retrieveTranslationMessages)(docusaurusContext);
    },
    async postBuild({ outDir, baseUrl }) {
        const index = await retrieveIndex(baseUrl);
        return writeIndex(outDir, index);
    }
});
// eslint-disable-next-line no-new-func
const importDynamic = new Function('modulePath', 'return import(modulePath)');
async function retrieveIndex(baseUrl) {
    const { defaultHtmlSchema, populateFromGlob } = await importDynamic('@lyrasearch/plugin-parsedoc');
    const db = (0, lyra_1.create)({ schema: defaultHtmlSchema });
    await populateFromGlob(db, '**/*.html', {
        transformFn: (node) => {
            switch (node.tag) {
                case 'strong':
                case 'a':
                case 'time':
                case 'code':
                case 'span':
                case 'small':
                case 'b':
                case 'p':
                case 'ul':
                    return { ...node, raw: `<p>${node.content}</p>` };
                default:
                    return node;
            }
        }
    });
    return Object.values(db.docs)
        .map(node => defaultToSectionSchema(node, baseUrl))
        .filter(isIndexable);
}
function defaultToSectionSchema(node, baseUrl) {
    const { id, content, type } = node;
    const pageRoute = `${baseUrl}${id.split('/').slice(1, -2).join('/')}`;
    const sectionTitle = (pageRoute.split('/').pop() ?? '')
        .replace(/(-)+/g, ' ')
        .split(' ')
        .map(word => word && `${word[0].toUpperCase()}${word.substring(1)}`)
        .join(' ');
    return {
        pageRoute,
        sectionTitle,
        sectionContent: content,
        type
    };
}
function isIndexable(doc) {
    return (!!doc.sectionContent &&
        !!doc.sectionTitle &&
        doc.type !== 'script' &&
        !doc.pageRoute.startsWith('/blogs/tags/'));
}
async function writeIndex(path, index) {
    return (0, promises_1.writeFile)((0, path_1.join)(path, 'lyra-search-index.json'), JSON.stringify(index));
}
exports.default = docusaurusLyraSearchPlugin;
