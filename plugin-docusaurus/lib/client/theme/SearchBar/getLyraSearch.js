import { create, insertWithHooks } from '@lyrasearch/lyra';
import { afterInsert, searchWithHighlight } from '@lyrasearch/plugin-match-highlight';
let searchFn;
export const getLyraSearch = async (baseUrl) => {
    if (!searchFn) {
        const indexData = await (await fetch(`${baseUrl}lyra-search-index.json`)).json();
        const db = create({
            schema: {
                pageRoute: 'string',
                sectionTitle: 'string',
                sectionContent: 'string',
                type: 'string'
            },
            hooks: {
                afterInsert
            }
        });
        indexData.forEach((record) => insertWithHooks(db, record));
        searchFn = (term) => searchWithHighlight(db, { term, properties: '*' });
    }
    return searchFn;
};
