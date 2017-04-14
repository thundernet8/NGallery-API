import * as mongoose from 'mongoose'
import * as bluebird from 'bluebird'
import * as autoIncrement from 'mongoose-auto-increment'
import { config } from '../../config/env'

export default function Mongo (): mongoose.Connection {
    (<any>mongoose).Promise = bluebird // use bluebird promises instead of mongoose promise library
    // 连接到 mongodb
    const options: mongoose.ConnectionOptions = {
        server: { socketOptions: { keepAlive: 1 } }
    }
    const db: mongoose.Connection = mongoose.connect(config.db, options).connection

    // 初始化AutoIncrement插件
    autoIncrement.initialize(db)

    // print mongoose logs in dev and test env
    if (config.debug) {
        mongoose.set('debug', true)
    }

    return db
}
