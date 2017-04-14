import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as Promise from 'bluebird'
import * as EmailValidator from 'email-validator'
import PostImage, { IPostImage } from '../dataContract/data.postImage'
import * as autoIncrement from 'mongoose-auto-increment'
import IBaseDocument from './IBaseDocument'
import { IUserDocument } from '../models/user.model'

enum PostStatus {
    publish, // 已发布
    trash, // 已删除
    draft, // 草稿
    pending // 待审
}

enum PostType {
    share, // 单张图片分享
    gallery // 多张图片图集
}

// Document interface
interface IPostDocument extends IBaseDocument {
    title: string;
    content: string;
    status: PostStatus;
    type: PostType;
    author: mongoose.Schema.Types.ObjectId | IUserDocument;
    images: IPostImage[];
    featuredImage: IPostImage;
    comments: number;
    views: number;
    likes: number;
}

// Model interface
interface IPostModel extends mongoose.Model<IPostDocument> {
    // statics
    findByNewId(id: string): Promise<IPostDocument>;
}

const PostSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    },
    status: {
        type: PostStatus,
        required: true,
        default: PostStatus.draft
    },
    type: {
        type: PostType,
        required: true,
        default: PostType.gallery
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // population 关联 User
        ref: 'User',
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    featuredImage: {
        type: PostImage,
        required: true
    },
    comments: {
        type: Number,
        required: true,
        default: 0
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    likes: {
        type: Number,
        required: true,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deleteBy: {
        type: Number,
        default: null
    },
    deleteDate: {
        type: Date,
        default: null
    }
}, { id: false }) // 去除mongoose默认的id
    .pre('save', function (next) {
        this.updatedAt = new Date()
        next()
    })

// 挂载AutoIncrement插件
PostSchema.plugin(autoIncrement.plugin, {
    model: 'Post',
    field: 'id',
    startAt: 0,
    incrementBy: 1
})

PostSchema.set('toJSON', { getters: true, virtuals: true })

// Post静态方法
PostSchema.statics = {

    /**
     * 通过ID查询单篇Post
     * @param {string} id - 文章ID
     * @returns {Promise<any>} 返回包含post的Promise
     */
    findByNewId: function (id: Number): Promise<IPostDocument> {
        return this
            .findOne({ id: id })
            .populate('author', 'username', 'nickname', 'email', 'id', 'createdAt', 'active', 'role', 'avatar') // 将author转化为实体
            .exec()
            .then((post: IPostDocument) => {
                if (post) {
                    return post
                }
                return Promise.reject(new restify.NotFoundError('post not exist'))
            })
    }
}

const Post: IPostModel = <IPostModel>mongoose.model<IPostDocument>('Post', PostSchema)

export { Post, IPostDocument, IPostModel, IPostImage, PostStatus, PostType }
