import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'

export default class UserController implements IController {
    /**
     * Search for a user by username, and append it to req.params if successful.
     * @param req
     * @param res
     * @param next
     * @returns {IUserDocument}
     */
    public load (req: restify.Request, res: restify.Response, next: restify.Next) {
        User.findByLogin(req.params.username)
        .then((user: IUserDocument) => {
            req.params.user = user
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * Get a user
     * @param req
     * @param res
     * @param next
     * @returns {IUserDocument}
     */
    public get (req: restify.Request, res: restify.Response, next: restify.Next) {
        res.json(HttpStatus.OK, req.params.user)
        return next()
    }

    /**
     * Create a new user from a username and other more information, and then return it
     * @param req
     * @param res
     * @param next
     * @property {string} req.params.username - The username of the new user
     * @property {string} req.params.email - The email of the new user
     * @property {string} req.params.password - The password
     * @returns {IUserDocument}
     */
    public create (req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: IUserDocument = new User({
            username: req.params.username,
            email: req.params.email,
            password: md5(req.params.password), //TODO maybe salt it
            nickname: req.params.username,
            active: false,
            createdAt: new Date(),
            role: UserRole.subscriber
        })

        return user
        .save()
        .then((savedUser: IUserDocument) => {
            res.json(HttpStatus.CREATED, savedUser)
            return next()
        })
        .catch((err: any) => next(err))
    }

    public update (req: restify.Request, res: restify.Response, next: restify.Next) {

    }

    public remove (req: restify.Request, res: restify.Response, next: restify.Next) {

    }
}
