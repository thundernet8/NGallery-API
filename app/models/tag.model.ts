import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as autoIncrement from 'mongoose-auto-increment'
import IBaseDocument from './IBaseDocument'
import { Post, IPostDocument, PostType } from '../models/post.model'

// Document interface
interface ITagDocument extends IBaseDocument {
    id: number;
    name: string;
    description: string;
    slug: string;
    postsCount: number; // Virtual

    // methods
    getPostsCount(): number;
}

// Model interface
interface ITagModel extends mongoose.Model<ITagDocument> {
    // statics
    findByNewId(id: string): Promise<ITagDocument>;
    findByName(name: string): Promise<ITagDocument>;
    findBySlug(slug: string): Promise<ITagDocument>;
    getAllTagPostsCount(): Promise<Array<any>>;
}

const TagSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
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
TagSchema.plugin(autoIncrement.plugin, {
    model: 'Tag',
    field: 'id',
    startAt: 0,
    incrementBy: 1
})

// 添加Virtual字段
// TagSchema.virtual('postsCount').get(function () { // 不支持异步
//     return this.getPostsCount()
// })

TagSchema.set('toJSON', { getters: true, virtuals: true })

// Tag静态方法
TagSchema.statics = {

    /**
     * 通过ID查询单个标签
     * @param {Number} id - 标签ID
     * @returns {Promise<any>} 返回包含tag的Promise
     */
    findByNewId: function (id: Number): Promise<ITagDocument> {
        return this
            .findOne({ id: id })
            .exec()
            .then((tag: ITagDocument) => {
                if (tag) {
                    return tag
                }
                return Promise.reject(new restify.NotFoundError('tag not exist'))
            })
    },

    /**
     * 通过标签名查找tag
     * @param {string} name - 标签名
     * @returns {Promise<any>} 返回包含tag的Promise
     */
    findByName: function (name: string): Promise<ITagDocument> {
        return this
            .findOne({ name: name })
            .exec()
            .then((tag: ITagDocument) => {
                if (tag) {
                    return tag
                }
                return Promise.reject(new restify.NotFoundError('tag not exist'))
            })
    },

    /**
     * 通过标签Slug查找tag
     * @param {string} slug - 标签slug
     * @returns {Promise<any>} 返回包含tag的Promise
     */
    findBySlug: function (slug: string): Promise<ITagDocument> {
        return this
            .findOne({ slug: slug })
            .exec()
            .then((tag: ITagDocument) => {
                if (tag) {
                    return tag
                }
                return Promise.reject(new restify.NotFoundError('tag not exist'))
            })
    },

    /**
     * 获取所有标签的posts数量
     */
    getAllTagPostsCount: async function (): Promise<Array<any>> {
        return await Post.aggregate([
            { $match: { deleted: false, type: PostType.gallery } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } }
        ])
        .exec()
    }
}

// Tag实例方法
TagSchema.methods = {
    /**
     * 获取包含标签的posts数量
     * @returns {Number}
     */
    getPostsCount: async function (): Promise<Number> {
        return await Post.count({
            tags: this.id,
            deleted: false,
            type: PostType.gallery
        })
        .exec()
    }
}

const Tag: ITagModel = <ITagModel>mongoose.model<ITagDocument>('Tag', TagSchema)

export { Tag, ITagDocument, ITagModel }
