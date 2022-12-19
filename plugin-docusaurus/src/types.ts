import { PropertiesSchema } from '@lyrasearch/lyra'

export interface SectionSchema extends PropertiesSchema {
  type: 'string'
  sectionContent: 'string'
  pageRoute: 'string'
  sectionTitle: 'string'
}
