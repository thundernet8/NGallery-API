import { UserRole } from '../models/user.model'

export default class UserData {

    public id: number

    public username: string

    public nickname: string

    public createdAt: Date

    public role: string

    public email?: string

    public updatedAt?: Date

    public active?: boolean

    public avatar: string // 64x64

    public largeAvatar: string // 128x128
}
