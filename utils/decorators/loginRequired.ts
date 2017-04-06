import * as restify from 'restify'

export default function loginRequired (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = (req: restify.Request, res: restify.Response, next: restify.Next): void => {
        if (!req.username) {
            return next(new restify.UnauthorizedError('Unauthorized'))
        } else {
            return originalMethod(req, res, next)
        }
    }
}
