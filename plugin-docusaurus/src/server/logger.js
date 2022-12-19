const pino = require('pino')

const logger = pino({ name: 'plugin-docusaurus' })

module.exports = logger
