import * as restify from 'restify'
import UserController from '../controllers/user.controller'
import MeController from '../controllers/me.controller'

const userController = new UserController()
const meController = new MeController()

export default (api: restify.Server) => {
    /** GET - Get user */
    api.get('/api/v1/users/:username', userController.load, userController.get)

    /** POST - Create user(signup) */
    api.post('/api/v1/users', userController.create)

    /** PUT - Update user */
    api.put('/api/v1/users/:username', userController.load, userController.update)

    /** DELETE - Delete user */
    api.del('/api/v1/users/:username', userController.load, userController.remove)

    /** GET - Get currrent user */
    api.get('/api/v1/me', meController.get)
}
