import * as restify from 'restify'
import TokenController from '../controllers/token.controller'

const controller = new TokenController()

export default (api: restify.Server) => {
    /** POST - Create token(signin) */
    api.post('/api/v1/users/token', controller.load, controller.create)
}
