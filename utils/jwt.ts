import * as jwt from 'jwt-simple'
import { config } from '../config/env'

const jwtTokenSecret = config.jwtSecret

export const encode = (uid: string) => {
    let expires = new Date().getTime() + (1000 * 60 * 60 * 24 * 30)
    let token = jwt.encode({
        uid, // username
        expires
    }, jwtTokenSecret)

    return {
        expires,
        accessToken: token
    }
}

export const decode = (token: string) => {
    return jwt.decode(token, jwtTokenSecret) || null
}
