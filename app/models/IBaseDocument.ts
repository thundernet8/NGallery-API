import * as mongoose from 'mongoose'

interface IDeletableDoc extends mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deleteDate: Date;
    deleteBy: Number;
}

export default IDeletableDoc