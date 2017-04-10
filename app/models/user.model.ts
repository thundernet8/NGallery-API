import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as Promise from 'bluebird'
import * as EmailValidator from 'email-validator'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

enum UserRole {
    admin,
    editor,
    author,
    contributor,
    subscriber
}

// Document interface
interface IUserDocument extends mongoose.Document {
    username: string;
    nickname: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
    password: string;
    role: UserRole;
    avatar: string
}

// Model interface
interface IUserModel extends mongoose.Model<IUserDocument> {
    findById (id: string): any;
    findByLogin (login: string): any;
    findByEmail (email: string): any;
    findByLoginOrEmail (loginOrEmail: string): any;
}

const UserSchema = new Schema({
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
    avatar: {
        type: String
    }
})

// Statics
UserSchema.statics = {

    /**
     * 通过ID查询单个用户 // 覆盖默认findById方法
     * @param {string} id - 用户ID
     * @returns {Promise<any>} 返回包含user的Promise
     */
    findById: function (id: string): Promise<IUserDocument> {
        return this
        .findOne({ _id: ObjectId(id) })
        .exec()
        .then((user: IUserModel) => {
            if (user) {
                return user
            }
            return Promise.reject(new restify.NotFoundError('user not exist'))
        })
    },

    /**
     * Get a user by username
     * @param {string} username - The login name of user
     * @returns {Promise<any>} Return a Promise of the user
     */
    findByLogin: function (username: string): Promise<IUserDocument> {
        return this
        .findOne({ username: username })
        .exec()
        .then((user: IUserModel) => {
            if (user) {
                return user
            }
            return Promise.reject(new restify.NotFoundError('user not exist'))
        })
    },

    /**
     * Get a user by email
     * @param {string} email - The email of user
     * @returns {Promise<any>} Return a Promise of the user
     */
    findByEmail: function (email: string): Promise<IUserDocument> {
        return this
        .findOne({ email: email })
        .exec()
        .then((user: IUserModel) => {
            if (user) {
                return user
            }
            return Promise.reject(new restify.NotFoundError('user not exist'))
        })
    },

    findByLoginOrEmail: function (loginOrEmail: string): Promise<IUserDocument> {
        if (!EmailValidator.validate(loginOrEmail)) {
            return this
            .findOne({ username: loginOrEmail })
            .exec()
            .then((user: IUserModel) => {
                if (user) {
                    return user
                }
                return Promise.reject(new restify.NotFoundError('user not exist'))
            })
        } else {
            return this
            .findOne({ email: loginOrEmail })
            .exec()
            .then((user: IUserModel) => {
                if (user) {
                    return user
                }
                return Promise.reject(new restify.NotFoundError('user not exist'))
            })
        }
    }
}

const User: IUserModel = <IUserModel>mongoose.model('User', UserSchema)

export { User, IUserDocument, IUserModel, UserRole }
