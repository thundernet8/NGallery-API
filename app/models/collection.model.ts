import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as Promise from 'bluebird'
import * as autoIncrement from 'mongoose-auto-increment'
import IBaseDocument from './IBaseDocument'
import PostImage, { IPostImage } from '../dataContract/data.postImage'
import { IUserDocument } from './user.model'

// Document interface
interface ICollectionDocument extends IBaseDocument {
    id: Number;
    name: string;
    description: string;
    slug: string;
    featuredImage: IPostImage;
    smallThumbs: IPostImage[];
    posts: Number[]; // 文章ID的数组
    followers: Number[]; // 关注用户ID的数组
    postsCount: Number; // Virtual
    followersCount: Number; // Virtual
    author: mongoose.Schema.Types.ObjectId | IUserDocument;
    secret: Boolean

    // methods
    getPostsCount(): Number;
    getFollowersCount(): Number;
    getThumbs(): IPostImage[]; // 第一个为featuredImage，其他为smallThumbs
}

// Model interface
interface ICollectionModel extends mongoose.Model<ICollectionDocument> {
    // statics
    findByNewId(id: string): Promise<ICollectionDocument>;
    findByName(name: string): Promise<ICollectionDocument>;
    findBySlug(slug: string): Promise<ICollectionDocument>;
}

const CollectionSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    featuredImage: {
        type: PostImage
    },
    smallThumbs: {
        type: Array
    },
    posts: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // population 关联 User
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    },
    secret: {
        type: Boolean,
        default: false
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
CollectionSchema.plugin(autoIncrement.plugin, {
    model: 'Collection',
    field: 'id',
    startAt: 0,
    incrementBy: 1
})

// 添加Virtual字段
CollectionSchema.virtual('postsCount').get(function () {
    return this.getPostsCount()
})
CollectionSchema.virtual('followersCount').get(function () {
    return this.getPostsCount()
})

CollectionSchema.set('toJSON', { getters: true, virtuals: true })

// Collection静态方法
CollectionSchema.statics = {

    /**
     * 通过ID查询单个收藏夹
     * @param {Number} id - 收藏夹ID
     * @returns {Promise<any>} 返回包含collection的Promise
     */
    findByNewId: function (id: Number): Promise<ICollectionDocument> {
        return this
            .findOne({ id: id })
            .populate('author', 'username', 'nickname', 'email', 'id', 'createdAt', 'active', 'role', 'avatar') // 将author转化为实体
            .exec()
            .then((collection: ICollectionModel) => {
                if (collection) {
                    return collection
                }
                return Promise.reject(new restify.NotFoundError('collection not exist'))
            })
    },

    /**
     * 通过名称查找单个收藏夹
     * @param {string} name - collection名称
     * @returns {Promise<any>} 返回包含collection的Promise
     */
    findByName: function (name: string): Promise<ICollectionDocument> {
        return this
            .findOne({ name: name })
            .populate('author', 'username', 'nickname', 'email', 'id', 'createdAt', 'active', 'role', 'avatar') // 将author转化为实体
            .exec()
            .then((collection: ICollectionModel) => {
                if (collection) {
                    return collection
                }
                return Promise.reject(new restify.NotFoundError('collection not exist'))
            })
    },

    /**
     * 通过收藏夹Slug查找单个收藏夹
     * @param {string} slug - 收藏夹slug
     * @returns {Promise<any>} 返回包含collection的Promise
     */
    findBySlug: function (slug: string): Promise<ICollectionDocument> {
        return this
            .findOne({ slug: slug })
            .populate('author', 'username', 'nickname', 'email', 'id', 'createdAt', 'active', 'role', 'avatar') // 将author转化为实体
            .exec()
            .then((collection: ICollectionModel) => {
                if (collection) {
                    return collection
                }
                return Promise.reject(new restify.NotFoundError('collection not exist'))
            })
    }

    // TODO find multi collections
    // posts|followers counts 一次性查询避免每个collection单独查询
}

// Collection实例方法
CollectionSchema.methods = {
    /**
     * 获取收藏夹包含的posts数量
     * @returns {Number}
     */
    getPostsCount: function (): Number {
        // TODO
        return 0
    },

    /**
     * 获取收藏夹包含的followers数量
     * @returns {Number}
     */
    getFollowersCount: function (): Number {
        // TODO
        return 0
    }
}

const Collection: ICollectionModel = <ICollectionModel>mongoose.model<ICollectionDocument>('Collection', CollectionSchema)

export { Collection, ICollectionDocument, ICollectionModel }
