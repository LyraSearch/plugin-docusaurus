import { autocomplete } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic/dist/theme.min.css';
import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getLyraSearch } from './getLyraSearch';
import { useColorMode } from '@docusaurus/theme-common';
import { Footer } from './Footer';
import '../../../../search.css';
const templates = {
    item({ item }) {
        return (React.createElement("a", { className: "aa-ItemLink", href: item.pageRoute },
            React.createElement("div", { className: "aa-ItemContent" },
                React.createElement("div", { className: "aa-ItemContentBody" },
                    React.createElement("div", { className: "aa-ItemContentTitle" },
                        React.createElement("h5", { style: { marginBottom: 0 } }, item.sectionTitle)),
                    React.createElement("div", { className: "aa-ItemContentDescription" }, snippet(item))))));
    }
};
function renderNotEnabledMessage({ render }, root) {
    render(React.createElement(React.Fragment, null,
        React.createElement("div", { className: "aa-PanelLayout aa-Panel--scrollable" }, "No search data available, lyra search is only available on production builds."),
        React.createElement(Footer, null)), root);
}
function snippet(item) {
    const PADDING = 20;
    const PADDING_MARKER = '...';
    const isBeginning = item.position.start < PADDING;
    const isEnd = item.position.start + item.position.length >
        item.sectionContent.length - PADDING;
    const preMatch = item.sectionContent.substring(isBeginning ? 0 : item.position.start - PADDING, item.position.start);
    const match = item.sectionContent.substring(item.position.start, item.position.start + item.position.length);
    const postMatch = item.sectionContent.substring(item.position.start + item.position.length, item.position.start + item.position.length + PADDING);
    return (React.createElement("p", null,
        isBeginning ? '' : PADDING_MARKER,
        preMatch,
        React.createElement("u", null, match),
        postMatch,
        isEnd ? '' : PADDING_MARKER));
}
export default function SearchBar() {
    const isBrowser = useIsBrowser();
    const { siteConfig } = useDocusaurusContext();
    const containerRef = useRef(null);
    const { colorMode } = useColorMode();
    useEffect(() => {
        if (!containerRef.current || !isBrowser) {
            return undefined;
        }
        const search = autocomplete({
            container: containerRef.current,
            // @ts-expect-error render typing here is for preact, react also works
            renderer: { createElement, Fragment, render },
            openOnFocus: true,
            detachedMediaQuery: '',
            async getSources({ query }) {
                try {
                    const lyraSearch = await getLyraSearch(siteConfig.baseUrl);
                    return [
                        {
                            sourceId: 'lyra',
                            getItems() {
                                const results = lyraSearch(query);
                                const processed = results.flatMap(hit => Object.values(hit.positions.sectionContent).flatMap(positions => positions.map(position => ({
                                    ...hit.document,
                                    position
                                }))));
                                return processed;
                            },
                            getItemUrl({ item }) {
                                return item.pageRoute;
                            },
                            templates
                        }
                    ];
                }
                catch (e) {
                    // won't work in dev build mode, TODO a better error message here?
                    return [];
                }
            },
            render({ sections, render }, root) {
                render(React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "aa-PanelLayout aa-Panel--scrollable" }, sections),
                    React.createElement(Footer, null)), root);
            },
            renderNoResults: process.env.NODE_ENV === 'production'
                ? undefined
                : renderNotEnabledMessage
        });
        return () => {
            search.destroy();
        };
    }, [isBrowser, siteConfig]);
    useEffect(() => {
        colorMode === 'dark'
            ? document.body.classList.add(colorMode)
            : document.body.classList.remove('dark');
    }, [colorMode]);
    return React.createElement("div", { ref: containerRef });
}
