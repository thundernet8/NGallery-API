import { config } from './config/env'
import { app } from './config/restify'
import { logger } from './utils/logger'
import Mongo from './app/services/mongo'

const db = Mongo()
// throw error on db error
db.on('error', (err: any) => {
    throw new Error(`Unable to connect to database: ${err}`)
})

// start the server as soon as db connection is made
db.once('open', () => {
    config.debug && logger.info(`Connected to database: ${config.db}`)
    app.listen(config.port, () => {
        config.debug && logger.info(`${config.name} is running at ${app.url}`)
    })
})

export { app }
