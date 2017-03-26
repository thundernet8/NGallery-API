import * as fs from 'fs'
import * as restify from 'restify'
import * as path from 'path'
import * as helmet from 'helmet'
import * as compress from 'compression'
import { config } from './env'
import { logger } from '../utils/logger'
import bearerParser from '../utils/bearerParser'
import HttpStatus from '../utils/httpStatus'

// create Restify server with the configured name
const app: restify.Server = restify.createServer({ name: config.name, version: config.version })

// parse the body of the request into req.params
app.use(restify.bodyParser())

// parse the authorization header(JWT)
app.use(bearerParser())

// 抵御一些常见的安全风险
app.use(helmet())

// Gzip
app.use(compress())

// user-defined middleware
app.use((req: restify.Request, res: restify.Response, next: restify.Next) => {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*')

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, AccessToken')
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')

    if (req.method === 'OPTIONS') {
        // 跨域并设置headers的请求，所有请求需要两步完成！
        // 第一步：发送预请求 OPTIONS 请求。此时 服务器端需要对于OPTIONS请求作出响应 一般使用202响应即可 不用返回任何内容信息。
        res.status(HttpStatus.NOCONTENT)
    } else {
        return next()
    }

    // disable caching so we'll always get the latest data
    res.setHeader('Cache-Control', 'no-cache')

    // log the request method and url
    logger.info(`${req.method} ${req.url}`)

    // log the request body
    logger.info(`Params: ${JSON.stringify(req.params)}`)

    return next()
})

// add route handlers
const pathToRoutes: string = path.join(config.root, '/app/routes')
fs.readdir(pathToRoutes, (err: any, files: string[]) => {
    if (err) {
        throw new Error(err)
    } else {
        files
        .filter((file: string) => path.extname(file) === '.js')
        .forEach((file: string) => {
            const route = require(path.join(pathToRoutes, file))
            route.default(app)
        })
    }
})

export { app }
