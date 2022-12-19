import { SearchResultWithHighlight } from '@lyrasearch/plugin-match-highlight';
import { SectionSchema } from '../../../types';
export declare const getLyraSearch: (baseUrl: string) => Promise<(term: string) => SearchResultWithHighlight<SectionSchema>[]>;
