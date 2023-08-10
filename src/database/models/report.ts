import mongoose from 'mongoose'

const reportSchema: any = new mongoose.Schema({
    channelId: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    reports: { type: Boolean, default: false },
    last_report_date: { type: Date, default: null },
    statistics: {
        viewCount: { type: String, default: '0' },
        subscriberCount: { type: String, default: '0' },
        hiddenSubscriberCount: { type: Boolean, default: null },
        videoCount: { type: String, default: '0' }
    },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },

}, { timestamps: true })

export const reportModel = mongoose.model('report', reportSchema)