import * as restify from 'restify'
import { User, IUserDocument, IUserModel, UserRole } from '../../app/models/user.model'

export default function loginRequired (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = (req: restify.Request, res: restify.Response, next: restify.Next): any => {
        if (req.username && req.authorization && req.authorization.credentials) {
            return User.findByLogin(req.username)
            .then((user: IUserDocument) => {
                req.params.loggedUser = user
                return originalMethod(req, res, next)
            })
            .catch(() => next(new restify.UnauthorizedError('Unauthorized')))
        }
        return next(new restify.UnauthorizedError('Unauthorized'))
    }
}
