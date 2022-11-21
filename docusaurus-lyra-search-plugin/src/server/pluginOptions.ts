import { Joi } from '@docusaurus/utils-validation'

export type PluginOptions = {
  id: string
  indexDocs: boolean
  indexDocSidebarParentCategories: number
  indexBlog: boolean
  indexPages: boolean
  maxSearchResults: number
}

const pluginOptionsSchema = Joi.object<PluginOptions>({
  id: Joi.string(),
  indexDocs: Joi.boolean().default(true),
  indexDocSidebarParentCategories: Joi.number()
    .integer()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
  indexBlog: Joi.boolean().default(true),
  indexPages: Joi.boolean().default(true),
  maxSearchResults: Joi.number().integer().min(1).default(8)
})

export const validateOptions = (options: PluginOptions) => {
  const validationResult = pluginOptionsSchema.validate(options)
  if (validationResult.error) {
    throw new Error(`Invalid plugin options: ${validationResult.error.message}`)
  }
  return validationResult.value
}
