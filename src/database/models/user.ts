import mongoose from 'mongoose'

const userSchema: any = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    userName: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    image: { type: String, default: null },
    userId: { type: Number, default: null },
    isYoutubeSignIn: { type: Boolean, default: false },
    youtubeChannels: [
        {
            userYoutubeAccessToken: { type: String, default: null },
            userYoutubeRefreshToken: { type: String, default: null },
            channelTitle: { type: String, default: null },
            channelId: { type: String, default: null },
            isUse: { type: Boolean, default: false }
        }
    ],
    analyze: {
        demographics: { type: Boolean, default: false },
        viewCounts: { type: Boolean, default: false },
        myVideos: { type: Boolean, default: false },
        adRevenue: { type: Boolean, default: false },
        trends: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true })

export const userModel = mongoose.model('user', userSchema)