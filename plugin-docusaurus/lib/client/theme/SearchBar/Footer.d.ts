/// <reference types="react" />
export type FooterTranslations = Partial<{
    selectText: string;
    selectKeyAriaLabel: string;
    navigateText: string;
    navigateUpKeyAriaLabel: string;
    navigateDownKeyAriaLabel: string;
    closeText: string;
    closeKeyAriaLabel: string;
    searchByText: string;
}>;
type FooterProps = Partial<{
    translations: FooterTranslations;
}>;
export declare function Footer({ translations }: FooterProps): JSX.Element;
export {};
