const { Joi } = require('@docusaurus/utils-validation')

const pluginOptionsSchema = Joi.object({
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

const validateOptions = options => {
  const validationResult = pluginOptionsSchema.validate(options)
  if (validationResult.error) {
    throw new Error(`Invalid plugin options: ${validationResult.error.message}`)
  }
}

module.exports = {
  validateOptions
}
