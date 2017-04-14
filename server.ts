import { config } from './config/env'
import { app } from './config/restify'
import { logger } from './utils/logger'
import Mongo from './app/services/mongo'

if (config.debug) {
    const db = Mongo()
    // throw error on db error
    db.on('error', (err: any) => {
        throw new Error(`Unable to connect to database: ${err}`)
    })

    // start the server as soon as db connection is made
    db.once('open', () => {
        logger.info(`Connected to database: ${config.db}`)
        app.listen(config.port, () => {
            logger.info(`${config.name} is running at ${app.url}`)
        })
    })
} else {
    app.listen(config.port)
}

export { app }
