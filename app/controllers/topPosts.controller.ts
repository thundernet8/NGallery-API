import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'
import UserData from '../dataContract/data.user'

export default class TopPostsController implements IController {
    /**
     * 查询热门精选Posts, 并添加至req.params.
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
     * 获取热门精选Posts, 类型可以为昨日/过去一周/过去一月
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
        res.json(HttpStatus.OK, userData)
        return next()
    }
}
