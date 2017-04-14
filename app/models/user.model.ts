import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as Promise from 'bluebird'
import * as EmailValidator from 'email-validator'
import * as autoIncrement from 'mongoose-auto-increment'
import IBaseDocument from './IBaseDocument'
import { config } from '../../config/env'

enum UserRole {
    admin,
    editor,
    author,
    contributor,
    subscriber
}

// Document interface
interface IUserDocument extends IBaseDocument {
    id: Number;
    username: string;
    nickname: string;
    email: string;
    active: boolean;
    password: string;
    role: UserRole;
    avatar: string; // Virtual

    // methods
    getAvatar(): string;
}

// Model interface
interface IUserModel extends mongoose.Model<IUserDocument> {
    // statics
    findByNewId(id: string): Promise<IUserDocument>;
    findByLogin(login: string): Promise<IUserDocument>;
    findByEmail(email: string): Promise<IUserDocument>;
    findByLoginOrEmail(loginOrEmail: string): Promise<IUserDocument>;
}

const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: UserRole,
        required: true,
        default: UserRole.subscriber
    },
    //avatar: {
    //    type: String
    //},
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
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'id',
    startAt: 0,
    incrementBy: 1
})

// 添加Virtual字段
UserSchema.virtual('avatar').get(function () {
    return this.getAvatar()
})

UserSchema.set('toJSON', { getters: true, virtuals: true })

// User静态方法
UserSchema.statics = {

    /**
     * 通过ID查询单个用户
     * @param {Number} id - 用户ID
     * @returns {Promise<any>} 返回包含user的Promise
     */
    findByNewId: function (id: Number): Promise<IUserDocument> {
        return this
            .findOne({ id: id })
            .exec()
            .then((user: IUserDocument) => {
                if (user) {
                    return user
                }
                return Promise.reject(new restify.NotFoundError('user not exist'))
            })
    },

    /**
     * 通过用户名查找用户
     * @param {string} username - 用户登录名
     * @returns {Promise<any>} 返回包含User的Promise
     */
    findByLogin: function (username: string): Promise<IUserDocument> {
        return this
            .findOne({ username: username })
            .exec()
            .then((user: IUserDocument) => {
                if (user) {
                    return user
                }
                return Promise.reject(new restify.NotFoundError('user not exist'))
            })
    },

    /**
     * 通过邮箱查找用户
     * @param {string} email - 用户邮箱地址
     * @returns {Promise<any>} 返回包含User的Promise
     */
    findByEmail: function (email: string): Promise<IUserDocument> {
        return this
            .findOne({ email: email })
            .exec()
            .then((user: IUserDocument) => {
                if (user) {
                    return user
                }
                return Promise.reject(new restify.NotFoundError('user not exist'))
            })
    },

    /**
     * 通过邮箱或用户名查找用户
     * @param {string} email - 用户名或邮箱地址
     * @returns {Promise<any>} 返回包含User的Promise
     */
    findByLoginOrEmail: function (loginOrEmail: string): Promise<IUserDocument> {
        if (!EmailValidator.validate(loginOrEmail)) {
            return this
                .findOne({ username: loginOrEmail })
                .exec()
                .then((user: IUserDocument) => {
                    if (user) {
                        return user
                    }
                    return Promise.reject(new restify.NotFoundError('user not exist'))
                })
        } else {
            return this
                .findOne({ email: loginOrEmail })
                .exec()
                .then((user: IUserDocument) => {
                    if (user) {
                        return user
                    }
                    return Promise.reject(new restify.NotFoundError('user not exist'))
                })
        }
    }
}

// User实例方法
UserSchema.methods = {
    /**
     * 获取用户头像
     * @returns {String} 头像链接
     */
    getAvatar: function (): String {
        if (!this.avatar) {
            // TODO 字母头像
        }
        return config.staticPre + this.avatar
    }
}

const User: IUserModel = <IUserModel>mongoose.model<IUserDocument>('User', UserSchema)

export { User, IUserDocument, IUserModel, UserRole }
