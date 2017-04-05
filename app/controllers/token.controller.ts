import { encode } from './../../utils/jwt';
import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'

export default class TokenController implements IController {
    /**
     * Search for a user by username|email, and append it to req.params if successful.
     * @param req
     * @param res
     * @param next
     * @returns {IUserDocument}
     */
    public load (req: restify.Request, res: restify.Response, next: restify.Next) {
        User.findByLoginOrEmail(req.params.username)
        .then((user: IUserDocument) => {
            // verify password
            if (md5(req.params.password) === user.password) {
                delete user.password
                req.params.user = user
                return next()
            } else {
                return next(new restify.UnauthorizedError('Login failed'))
            }
        })
        .catch((err: any) => next(err))
    }

    /**
     * Create a new token for the user requesting signin, and then return it
     * @param req
     * @param res
     * @param next
     * @property {string} req.params.username - The username or email of the new user
     * @property {string} req.params.password - The password
     * @return {object} - Object includes the access_token and expire information
     */
    public create (req: restify.Request, res: restify.Response, next: restify.Next) {
        const user = req.params.user
        return res.json(HttpStatus.CREATED, Object.assign({}, encode(req.params.user.username), {profile: user}))
    }
}
