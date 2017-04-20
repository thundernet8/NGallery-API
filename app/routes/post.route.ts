import * as restify from 'restify'
import PostController, { TopPostsController } from '../controllers/post.controller'

const postController = new PostController()
const topPostsController = new TopPostsController()

export default (api: restify.Server) => {
    /** GET - 查询一篇文章 */
    api.get('/api/v1/posts/:id', postController.load, postController.get)

    /** GET - 查询多篇文章 */
    api.get('/api/v1/posts', postController.gets)

    /** POST - 创建一篇文章 */
    api.post('/api/v1/posts', postController.create)

    /** PUT - 更新一篇文章 */
    api.put('/api/v1/posts/:id', postController.load, postController.update)

    /** DELETE - 删除一篇文章 */
    api.del('/api/v1/posts/:id', postController.load, postController.remove)

    /** GET - 获取热门三篇文章 */
    api.get('/api/v1/me', topPostsController.get, topPostsController.get)
}
