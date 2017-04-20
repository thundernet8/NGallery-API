import * as restify from 'restify'
import * as mongoose from 'mongoose'
import IController from './controller'
import { Post, IPostDocument, IPostImage, PostStatus, PostType } from '../models/post.model'
import { Tag, ITagDocument } from '../models/tag.model'
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

export default class TagController implements IController {
    /**
     * 搜索单个Tag, 并附加到req.params
     * @param req
     * @param res
     * @param next
     */
    public load(req: restify.Request, res: restify.Response, next: restify.Next) {
        Tag.findBySlug(req.params.slug)
            .then((tag: ITagDocument) => {
                req.params.tag = tag
                return next()
            })
            .catch((err: any) => next(err))
    }

    /**
     * 获取单个Tag
     * @param req
     * @param res
     * @param next
     * @returns {JSON}
     */
    public get(req: restify.Request, res: restify.Response, next: restify.Next) {
        const tag: ITagDocument = req.params.tag
        res.json(HttpStatus.OK, tag)
        return next()
    }

    /**
     * 获取多个Tag
     * @param req
     * @param res
     * @param next
     * @property {?offset} req.params.offset - 跳过的标签数量, 默认0
     * @property {?limit} req.params.limit - 返回的结果最大数量, 默认0, 即不限制
     * @returns {JSON}
     */
    public async gets(req: restify.Request, res: restify.Response, next: restify.Next) {
        // 未被引用的Tag不返回
        const tagCounts = await Tag.getAllTagPostsCount()
        let tagCountDict: any
        const tagIds = tagCounts.map(tagCount => {
            tagCountDict['_' + tagCount._id] = tagCount.count
            return tagCount._id
        })

        const offset = req.params.offset || 0
        let query = Tag.find({
            id: { $in: tagIds },
            deleted: false
        })

        query = query
        .sort({ name: 1 })
        .skip(offset)

        if (req.params.limit) {
            query = query.limit(Number(req.params.limit))
        }

        let tags = await query.exec()
        tags = tags.map(tag => {
            tag.postsCount = tagCountDict['_' + tag.id]
            return tag
        })

        res.json(HttpStatus.OK, tags)

        return next()
    }

    /**
     * 创建一个Tag并返回
     * @param req
     * @param res
     * @param next
     * @property {string} req.params.name - Tag标题
     * @property {string} req.params.description - Tag描述
     * @returns {ITagDocument}
     */
    @loginRequired
    public async create(req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.loggedUser
        const allowRoles = [UserRole.admin, UserRole.editor, UserRole.author, UserRole.contributor]
        if (allowRoles.indexOf(user.role) < 0) {
            return next(new restify.ForbiddenError('你没有权限创建标签'))
        }

        const name = req.params.name
        const description = req.params.description

        if (!name || name.length < 2) {
            return next(new restify.InvalidArgumentError('无效的标签名称'))
        }

        let tag: ITagDocument
        // 检查是否已存在同名Tag
        try {
            tag = await Tag.findByName(name)
            // return next(new restify.InvalidArgumentError('指定的标签已存在'))
        }
        catch (err) {}


        tag = tag || new Tag({
            name: name,
            description: description,
            slug: encodeURIComponent(name),
            createdAt: new Date()
        })

        return tag
            .save()
            .then((savedTag: ITagDocument) => {
                res.json(HttpStatus.CREATED, savedTag)
                return next()
            })
            .catch((err: any) => next(err))
    }

    /**
     * 更新标签
     * @param req
     * @param res
     * @param next
     */
    public update(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO
    }

    /**
     * 删除标签
     * @param req
     * @param res
     * @param next
     */
    @adminRequired
    public remove(req: restify.Request, res: restify.Response, next: restify.Next) {
        const tag: ITagDocument = req.params.tag
        const user: IUserDocument = req.params.loggedUser

        tag.deleted = true
        tag.deleteBy = user.id
        tag.deleteDate = new Date()

        return tag.save()
        .then(() => {
            res.json(HttpStatus.OK, { success: true, tid: tag.id })
            return next()
        })
        .catch((err: any) => next(err))
    }
}

export class TagPostsController implements IController {
    /**
     * 搜索当前Tag, 并附加到req.params
     * @param req
     * @param res
     * @param next
     * @returns {ICollectionDocument}
     */
    public load(req: restify.Request, res: restify.Response, next: restify.Next) {
        Tag.findBySlug(req.params.slug)
            .then((tag: ITagDocument) => {
                req.params.tag = tag
                return next()
            })
            .catch((err: any) => next(err))
    }

    /**
     * 获取标签下的文章(只有gallery类型)
     * @param req
     * @param res
     * @param next
     */
    public get(req: restify.Request, res: restify.Response, next: restify.Next) {
        const tag: ITagDocument = req.params.tag
        Post.find({
            tags: tag.id,
            type: PostType.gallery,
            deleted: false
        })
        .then((posts: IPostDocument[]) => {
            let postsData = posts.map(post => getPostDataFromPost(post))
            res.json(HttpStatus.OK, postsData)
            return next()
        })
        .catch((err: any) => next(err))
    }
}
