import { encode, decode } from './../utils/jwt';
import * as restify from 'restify'
import { config } from '../config/env'
import { User, IUserDocument, IUserModel, UserRole } from './models/user.model'
import HttpStatus from '../utils/httpStatus'

const requireAuth = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    if (req.username && req.authorization && req.authorization.credentials) {
        return User.findByLogin(req.username)
        .then((user: IUserDocument) => {
            return next()
        })
        .catch(() => next(new restify.UnauthorizedError('Authorize failed')))
    }
    return next(new restify.UnauthorizedError('Authorize failed'))
}

const requireAdmin = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    if (req.username && req.authorization && req.authorization.credentials) {
        return User.findByLogin(req.username)
        .then((user: IUserDocument) => {
            if (user.role === UserRole.admin) {
                return next()
            }
            return next(new restify.ForbiddenError('Permission denied'))
        })
        .catch(() => next(new restify.ForbiddenError('Permission denied')))
    }
    return next(new restify.ForbiddenError('Permission denied'))
}

export { requireAuth, requireAdmin }
