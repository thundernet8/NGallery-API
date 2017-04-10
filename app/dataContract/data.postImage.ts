export interface IPostImage {
    url: string;
    originalUrl: string;
    title: string;
    description: string;
}

export default class PostImage implements IPostImage {
    public constructor (url: string, originalUrl: string, title: string, description: string) {
        this.url = url
        this.originalUrl = originalUrl
        this.title = title
        this.description = description
    }

    public url: string

    public originalUrl: string

    public title: string

    public description: string
}
