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
import PostData from '../dataContract/data.post'
import PostImage from '../dataContract/data.postImage'
import { config } from '../../config/env'
import loginRequired from '../../utils/decorators/loginRequired'

export default class TagController implements IController {
    /**
     * 搜索单个Tag, 并附加到req.params
     * @param req
     * @param res
     * @param next
     * @returns {ICollectionDocument}
     */
    public load(req: restify.Request, res: restify.Response, next: restify.Next) {
        Tag.findByNewId(req.params.id)
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
     * 创建一个Tag并返回
     * @param req
     * @param res
     * @param next
     * @property {string} req.params.name - Tag标题
     * @property {string} req.params.description - Collection描述
     * @property {string} req.params.post - 首个包含该Tag的post
     * @returns {ICollectionDocument}
     */
    @loginRequired
    public async create(req: restify.Request, res: restify.Response, next: restify.Next) {
        const user: IUserDocument = req.params.user
        const allowRoles = [UserRole.admin, UserRole.editor, UserRole.author, UserRole.contributor]
        if (allowRoles.indexOf(user.role) < 0) {
            return next(new restify.ForbiddenError('你没有权限创建标签'))
        }

        const name = req.params.name
        const description = req.params.description
        const postId = req.params.post

        if (!name || name.length < 2) {
            return next(new restify.InvalidArgumentError('无效的标签名称'))
        }

        // 检查是否已存在同名Tag
        try {
            await Tag.findByName(name)
            return next(new restify.InvalidArgumentError('指定的标签已存在'))
        }
        catch (err) {

        }

        // 如果附带了post, 确保post存在
        let posts = []
        if (postId) {
            try {
                const post = await Post.findByNewId(postId)
                if (!post.deleted) {
                    posts = [postId]
                }
            }
            catch (err) {

            }
        }

        let tag: ITagDocument = new Tag({
            name: name,
            description: description,
            slug: encodeURIComponent(name),
            createdAt: new Date(),
            posts: postId ? [postId] : []
        })

        return tag
            .save()
            .then((savedTag: ITagDocument) => {
                res.json(HttpStatus.CREATED, savedTag)
                return next()
            })
            .catch((err: any) => next(err))
    }

    public update(req: restify.Request, res: restify.Response, next: restify.Next) {

    }

    public remove(req: restify.Request, res: restify.Response, next: restify.Next) {

    }
}