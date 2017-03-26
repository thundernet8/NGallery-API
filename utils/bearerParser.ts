import * as restify from 'restify'
import { encode, decode } from './jwt'

const bearerParser = (req: restify.Request, res: restify.Response, next: restify.Next): any => {
    const bearerHeader = req.header('authorization')
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ')
        if (bearer.length  > 1) {
            const ret = decode(bearer[1])
            if (ret && typeof ret === 'object' && ret.uid && ret.expire && ret.expire > new Date().getTime()) {
                req.username = ret.uid
                req.authorization = {
                    scheme: 'Bearer JWT',
                    credentials: bearer[1]
                }
            } else {
                req.username = ''
            }
        }
    }

    return next()
}

export default () => bearerParser
