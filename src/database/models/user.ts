import mongoose from 'mongoose'

const userSchema: any = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    userName: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    image: { type: String, default: null },
    userId: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true })

export const userModel = mongoose.model('user', userSchema)