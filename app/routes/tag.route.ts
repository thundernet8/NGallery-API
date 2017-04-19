import * as restify from 'restify'
import TagController, { TagPostsController } from '../controllers/tag.controller'

const tagController = new TagController()
const tagPostsController = new TagPostsController()

export default (api: restify.Server) => {
    /** GET - 查询一个标签 */
    api.get('/api/v1/tags/:slug', tagController.load, tagController.get)

    /** GET - 查询多个标签 */
    api.get('/api/v1/tags', tagController.gets) // ?hasPosts

    /** POST - 创建一个标签 */
    api.post('/api/v1/tags', tagController.create)

    /** PUT - 更新一个标签 */
    api.put('/api/v1/tags/:slug', tagController.load, tagController.update)

    /** DELETE - 删除一个标签 */
    api.del('/api/v1/tags/:slug', tagController.load, tagController.remove)

    /** GET - 获取标签下的文章(gallery) */
    api.get('/api/v1/tags/:slug/posts', tagPostsController.load, tagPostsController.get)
}
