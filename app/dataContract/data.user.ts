import { UserRole } from '../models/user.model'

export default class UserData {

    public _id: string

    public username: string

    public nickname: string

    public createdAt: Date

    public role: UserRole

    public email?: string

    public updatedAt?: Date

    public active?: boolean
}
