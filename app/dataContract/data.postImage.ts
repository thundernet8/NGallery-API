import { config } from '../../config/env'

export interface IPostImage {
    url: string;
    path: string; // 资源的相对路径，便于替换获得CDN外链地址
    title: string;
    description: string;
    width: Number;
    height: Number;
}

export default class PostImage implements IPostImage {
    public constructor (path: string, title: string, description: string) {
        this.path = path
        this.title = title
        this.description = description
        this.url = config.staticPre + path
    }

    public url: string

    public path: string

    public title: string

    public description: string

    public width: Number

    public height: Number
}
