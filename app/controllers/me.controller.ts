import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'
import UserData from '../dataContract/data.user'
import loginRequired from '../../utils/decorators/loginRequired'
import Validator from '../../utils/validator'

export default class MeController implements IController {
    /**
     * Search for current user, and append it to req.params if successful.
     * @param req
     * @param res
     * @param next
     * @returns {IUserDocument}
     */
    public load (req: restify.Request, res: restify.Response, next: restify.Next) {
        if (!req.username) {
            return next(new restify.UnauthorizedError('Unauthorized'))
        }
        User.findByLogin(req.username)
        .then((user: IUserDocument) => {
            req.params.loggedUser = user
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
    @loginRequired
    public get (req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.loggedUser
        let userData = new UserData()
        userData.id = user.id
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

    /**
     * 更新自己的资料
     * @param req
     * @param res
     * @param next
     */
    @loginRequired
    public update (req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.loggedUser
        if (req.params.avatar) {
            user.avatar = req.params.avatar
        }
        if (req.params.nickname) {
            user.nickname = req.params.nickname
        }
        if (req.params.email) {
            if (!Validator.isValidEmail(req.params.email)) {
                return next(new restify.InvalidArgumentError('无效的邮箱'))
            }
            user.email = req.params.email
        }

        user
        .save()
        .then((savedUser: IUserDocument) => {
            res.json(HttpStatus.OK, savedUser)
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * 删除自己的账户
     * @param req
     * @param res
     * @param next
     */
    @loginRequired
    public remove (req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: IUserDocument = req.params.loggedUser
        user.deleted = true
        user.deleteBy = user.id
        user.deleteDate = new Date()

        user
        .save()
        .then((savedUser: IUserDocument) => {
            res.json(HttpStatus.OK, {success: true, uid: user.id})
            return next()
        })
        .catch((err: any) => next(err))
    }
}
