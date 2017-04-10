import { PostType, PostStatus, IPostImage } from '../models/post.model'
import AuthorData from './data.author'

export default class PostData {

    public _id: string

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

    public comments: number

    public views: number

    public likes: number
}
