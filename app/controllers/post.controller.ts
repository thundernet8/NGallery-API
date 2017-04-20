import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { Post, IPostDocument, IPostImage, PostStatus, PostType } from '../models/post.model'
import { User, IUserDocument, UserRole } from '../models/user.model'
import { logger } from '../../utils/logger'
import * as md5 from 'md5'
import HttpStatus from '../../utils/httpStatus'
import UserData from '../dataContract/data.user'
import AuthorData from '../dataContract/data.author'
import PostData, { getPostDataFromPost } from '../dataContract/data.post'
import PostImage from '../dataContract/data.postImage'
import { config } from '../../config/env'
import loginRequired from '../../utils/decorators/loginRequired'
import adminRequired from '../../utils/decorators/adminRequired'

export default class PostController implements IController {
    /**
     * 搜索一篇Post, 并附加到req.params
     * @param req
     * @param res
     * @param next
     */
    public load (req: restify.Request, res: restify.Response, next: restify.Next) {
        Post.findByNewId(req.params.id)
        .then((post: IPostDocument) => {
            req.params.post = post
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * 获取一篇Post
     * @param req
     * @param res
     * @param next
     * @returns {PostData}
     */
    public get (req: restify.Request, res: restify.Response, next: restify.Next) {
        const post: IPostDocument = req.params.post
        const postData = getPostDataFromPost(post)
        res.json(HttpStatus.OK, postData)
        return next()
    }

    /**
     * 获取多篇Post
     * @param req
     * @param res
     * @param next
     * @property {?string} req.params.type - 文章类型(gallery|share)
     * @property {?offset} req.params.offset - 跳过的文章数量, 默认0
     * @property {?limit} req.params.limit - 返回的结果最大数量, 默认12
     * @returns {Array<PostData>}
     */
    public gets (req: restify.Request, res: restify.Response, next: restify.Next) {
        const offset = req.params.offset || 0
        const limit = Math.min(req.params.limit || 12, 20)
        Post.find()
        .sort({ id: -1 })
        .skip(offset)
        .limit(limit)
        .exec()
        .then((posts: IPostDocument[]) => {
            let postsData = posts.map((post) => {
                return getPostDataFromPost(post)
            })
            res.json(HttpStatus.OK, postsData)
        })

        return next()
    }

    /**
     * 创建一篇Post并返回
     * @param req
     * @param res
     * @param next
     * @property {string} req.params.title - Post标题
     * @property {string} req.params.content - Post内容
     * @property {string} req.params.password - The password
     * @returns {IPostDocument}
     */
    @loginRequired
    public create (req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.loggedUser
        const allowRoles = [UserRole.admin, UserRole.editor, UserRole.author, UserRole.contributor]
        if (allowRoles.indexOf(user.role) < 0) {
            return next(new restify.ForbiddenError('你没有权限发布Post'))
        }
        const status = req.params.status
        if (status === 'publish' && user.role === UserRole.contributor) {
            // 投稿用户Post必须先pending
            status === 'pending'
        }

        const images = req.params.images
        if (!(images instanceof Array) || images.length < 1) {
            return next(new restify.InvalidArgumentError('图片数据不合法'))
        }

        let postImages = images.map((image: any) => {
            return new PostImage(image.path, image.title, image.description)
        })

        const featuredImage = req.params.featuredImage
        let postFeaturedImage = featuredImage ? featuredImage as PostImage : postImages[0]

        const tags = req.params.tags || []

        let post: IPostDocument = new Post({
            title: req.params.title,
            content: req.params.content,
            createdAt: new Date(),
            status: PostStatus[status] === undefined ? PostStatus.pending : PostStatus[status],
            type: PostType[req.params.type] !== undefined ? PostType[req.params.type] : PostType.gallery,
            author: user._id,
            images: postImages,
            featuredImage: postFeaturedImage,
            tags: tags
        })

        return post
        .save()
        .then((savedPost: IPostDocument) => {
            res.json(HttpStatus.CREATED, savedPost)
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * 更新文章
     * @param req
     * @param res
     * @param next
     */
    public update (req: restify.Request, res: restify.Response, next: restify.Next) {
        // include tags update
        // TODO
    }

    /**
     * 删除文章
     * @param req
     * @param res
     * @param next
     */
    @adminRequired
    public remove (req: restify.Request, res: restify.Response, next: restify.Next) {
        let post: IPostDocument = req.params.post
        const user = req.params.loggedUser
        post.deleted = true
        post.deleteBy = user.id
        post.deleteDate = new Date()

        return post
        .save()
        .then((savedPost: IPostDocument) => {
            res.json(HttpStatus.OK, {success: true, pid: post.id})
            return next()
        })
        .catch((err: any) => next(err))
    }
}

export class TopPostsController implements IController {
    /**
     * 查询热门精选Posts, 并添加至req.params.
     * @param req
     * @param res
     * @param next
     * @returns {IUserDocument}
     */
    public load(req: restify.Request, res: restify.Response, next: restify.Next) {
        Post.findTopPosts()
        .then((posts: IPostDocument[]) => {
            req.params.topPosts = posts
            return next()
        })
        .catch((err: any) => next(err))
    }

    /**
     * 获取热门精选Posts, 类型可以为昨日/过去一周/过去一月
     * @param req
     * @param res
     * @param next
     * @returns {UserData}
     */
    public get(req: restify.Request, res: restify.Response, next: restify.Next) {
        const posts = req.params.topPosts
        res.json(HttpStatus.OK, posts)
        return next()
    }
}
