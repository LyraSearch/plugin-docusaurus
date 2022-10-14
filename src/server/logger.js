import pino from 'pino'

import { name } from '../../package.json'

const logger = pino({ name })

export default logger
