import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'
import UserData from '../dataContract/data.user'
import loginRequired from '../../utils/decorators/loginRequired'

export default class MeController implements IController {
    /**
     * Search for current user, and append it to req.params if successful.
     * @param req
     * @param res
     * @param next
     * @returns {IUserDocument}
     */
    @loginRequired
    public load (req: restify.Request, res: restify.Response, next: restify.Next) {
        // if (!req.username) {
        //     return next(new restify.UnauthorizedError('Unauthorized'))
        // }
        User.findByLogin(req.username)
        .then((user: IUserDocument) => {
            req.params.user = user
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * Get current user
     * @param req
     * @param res
     * @param next
     * @returns {UserData}
     */
    public get (req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.user
        let userData = new UserData()
        userData._id = user._id
        userData.username = user.username
        userData.nickname = user.nickname
        userData.createdAt = user.createdAt
        userData.role = UserRole[user.role]
        userData.email = user.email
        userData.updatedAt = user.updatedAt
        userData.active = user.active
        res.json(HttpStatus.OK, userData)
        return next()
    }

    public update (req: restify.Request, res: restify.Response, next: restify.Next) {

    }

    public remove (req: restify.Request, res: restify.Response, next: restify.Next) {

    }
}
