import * as path from 'path'
const packagesJSON = require('../package')

interface ConfigSettings {
    root: string;
    name: string;
    version: string;
    port: number;
    env: string;
    db: string;
    debug: boolean,
    jwtSecret: string
}

const env: string = process.env.NODE_ENV || 'development'
const debug: boolean = !!process.env.DEBUG || false

// default settings are for dev environment
const config: ConfigSettings = {
    name: 'NGallery API',
    version: packagesJSON.version,
    env: env,
    debug: debug,
    root: path.join(__dirname, '/..'),
    port: 5000, // API Server Port
    db: 'mongodb://localhost:27017/dev',
    jwtSecret: 'jwt_secret_NGallery_API' // change this
}

// settings for test environment
// *IMPORTANT* do not set test db to production db, as the tests will overwrite it.
if (env === 'test') {
    config.db = 'mongodb://localhost:27017/test'
}

// settings for production environment
if (env === 'production') {
    config.port = 5005
    config.db = 'mongodb://localhost:27017/prod'
    config.debug = false
}

export { config }
