import * as restify from 'restify'
import * as controller from '../controllers/ping.controller'

export default (api: restify.Server) => {
    api.get('/api/v1/ping', controller.pong)
}
