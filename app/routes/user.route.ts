import * as restify from 'restify'
import UserController from '../controllers/user.controller'

const controller = new UserController()

export default (api: restify.Server) => {
    /** GET - Get user */
    api.get('/api/v1/users/:username', controller.load, controller.get)

    /** POST - Create user(signup) */
    api.post('/api/v1/users', controller.create)

    /** PUT - Update user */
    api.put('/api/v1/users/:username', controller.load, controller.update)

    /** DELETE - Delete user */
    api.del('/api/v1/users/:username', controller.load, controller.remove)
}
