import * as restify from 'restify'
import * as controller from '../controllers/ping.controller'
import { requireAuth } from '../auth'

export default (api: restify.Server) => {
    api.get('/api/v1/ping', requireAuth, controller.pong)
}
