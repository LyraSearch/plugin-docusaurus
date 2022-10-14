import { Joi } from '@docusaurus/utils-validation'

// https://lyrajs.io/docs/usage/creating-a-new-lyra-instance
const languageSchema = Joi.string().valid(
  'nl',
  'en',
  'fr',
  'it',
  'no',
  'pt',
  'ru',
  'es',
  'sv'
)

const pluginOptionsSchema = Joi.object({
  indexDocs: Joi.boolean().default(true),
  indexDocSidebarParentCategories: Joi.number()
    .integer()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
  indexBlog: Joi.boolean().default(true),
  indexPages: Joi.boolean().default(true),
  language: Joi.alternatives(
    languageSchema,
    Joi.array().items(languageSchema)
  ).default('en'),
  maxSearchResults: Joi.number().integer().min(1).default(8)
})

export const validateOptions = options => {
  const validationResult = pluginOptionsSchema.validate(options)
  if (validationResult.error) {
    throw new Error(`Invalid plugin options: ${validationResult.error}`)
  }
}
