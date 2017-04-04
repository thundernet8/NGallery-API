import * as mongoose from 'mongoose'
import * as bluebird from 'bluebird'
import { config } from '../../config/env'

export default function Mongo (): mongoose.Connection {
    (<any>mongoose).Promise = bluebird // use bluebird promises instead of mongoose promise library
    // connect to mongodb
    const options: mongoose.ConnectionOptions = {
        server: { socketOptions: { keepAlive: 1 } }
    }
    const db: mongoose.Connection = mongoose.connect(config.db, options).connection

    // print mongoose logs in dev and test env
    if (config.debug) {
        mongoose.set('debug', true)
    }

    return db
}
