import { PostType, PostStatus, IPostImage, IPostDocument } from '../models/post.model'
import { IUserDocument } from '../models/user.model'
import { config } from '../../config/env'
import AuthorData from './data.author'

export default class PostData {

    public id: number

    public title: string

    public content: string

    public url: string

    public createdAt: Date

    public updatedAt?: Date

    public status: string

    public type: string

    public author: AuthorData

    public images: IPostImage[]

    public featuredImage: IPostImage

    public commentsCount: number

    public views: number

    public likes: number
}

export function getPostDataFromPost (post: IPostDocument) {
    const author: IUserDocument = <IUserDocument>post.author
    let authorData = new AuthorData()
    authorData.id = author.id
    authorData.name = author.nickname
    authorData.url = config.clientUrl + '/u/' + author.id
    authorData.avatar = author.avatar

    let postData = new PostData()
    postData.id = post.id
    postData.title = post.title
    postData.content = post.content
    postData.url = config.clientUrl + '/p/' + post._id
    postData.createdAt = post.createdAt
    postData.updatedAt = post.updatedAt
    postData.status = PostStatus[post.status]
    postData.type = PostType[post.type]
    postData.author = authorData
    postData.images = post.images
    postData.featuredImage = post.featuredImage
    postData.commentsCount = post.comments
    postData.views = post.views
    postData.likes = post.likes

    return postData
}
