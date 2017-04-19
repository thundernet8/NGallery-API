import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'
import UserData from '../dataContract/data.user'
import Validator from '../../utils/validator'
import loginRequired from '../../utils/decorators/loginRequired'
import adminRequired from '../../utils/decorators/adminRequired'

export default class UserController implements IController {
    /**
     * 获取路由指定的用户, 并添加至req.params
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
     * 取得用户对象并返回
     * @param req
     * @param res
     * @param next
     * @returns {UserData}
     */
    public get (req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.user
        let userData = new UserData()
        userData.id = user.id
        userData.username = user.username
        userData.nickname = user.nickname
        userData.createdAt = user.createdAt
        userData.role = UserRole[user.role]
        userData.avatar = user.getAvatar()
        userData.largeAvatar = user.getAvatar('large')
        res.json(HttpStatus.OK, userData)
        return next()
    }

    /**
     * 创建新用户(注册)
     * @param req
     * @param res
     * @param next
     * @property {string} req.params.username - 用户名
     * @property {string} req.params.email - 邮箱
     * @property {string} req.params.password - 密码
     * @returns {IUserDocument}
     */
    public create (req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: IUserDocument = new User({
            username: req.params.username,
            email: req.params.email,
            password: md5(req.params.password), // TODO maybe salt it
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

    /**
     * 更新用户
     * @param req
     * @param res
     * @param next
     */
    @loginRequired
    public update (req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: IUserDocument = req.params.user
        const loggedUser: IUserDocument = req.params.loggedUser
        if (user.username !== loggedUser.username && loggedUser.role !== UserRole.admin) {
            return next(new restify.ForbiddenError('你没有权限更新用户资料'))
        }
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
        // TODO admin update user role, user change password
        user
        .save()
        .then((savedUser: IUserDocument) => {
            res.json(HttpStatus.OK, savedUser)
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * 删除用户
     * @param req
     * @param res
     * @param next
     */
    @adminRequired
    public remove (req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: IUserDocument = req.params.user
        const loggedUser: IUserDocument = req.params.loggedUser
        user.deleted = true
        user.deleteBy = loggedUser.id
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
