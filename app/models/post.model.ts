import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as Promise from 'bluebird'
import * as EmailValidator from 'email-validator'
import { IPostImage } from '../dataContract/data.postImage'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

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
interface IPostDocument extends mongoose.Document {
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    status: PostStatus;
    type: PostType;
    author: number;
    images: IPostImage[];
    featuredImage: IPostImage;
    comments: number;
    views: number;
    likes: number;
    // favorites: number;
}



// Model interface
interface IPostModel extends mongoose.Model<IPostDocument> {
    findById (id: string): any;
}

const PostSchema = new Schema({
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
        type: Number,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    featuredImage: {
        type: Array,
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
    }
})

// Statics
PostSchema.statics = {

    /**
     * 通过ID查询单篇Post
     * @param {string} id - 文章ID
     * @returns {Promise<any>} 返回包含post的Promise
     */
    findById: function (id: string): Promise<IPostDocument> {
        return this
        .findOne({ _id: ObjectId(id) })
        .exec()
        .then((post: IPostModel) => {
            if (post) {
                return post
            }
            return Promise.reject(new restify.NotFoundError('post not exist'))
        })
    }
}

const Post: IPostModel = <IPostModel>mongoose.model('Post', PostSchema)

export { Post, IPostDocument, IPostModel, IPostImage, PostStatus, PostType }
