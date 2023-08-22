import mongoose from 'mongoose'

const influencerSchema: any = new mongoose.Schema({

    orderID: { type: String, default: null },
    payerID: { type: String, default: null },
    paymentSource: { type: String, default: null },
    facilitatorAccessToken: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    price: { type: Number, default: null },
    planType: { type: String, default: 'influencer' },
    planDuration: { type: Number, default: null },
    startingDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    dataExpiryDate: { type: Date, default: null },
    analyze: {
        demographics: { type: Boolean, default: false },
        viewCounts: { type: Boolean, default: false },
        myVideos: { type: Boolean, default: false },
        adRevenue: { type: Boolean, default: false },
        trends: { type: Boolean, default: false }
    },
    availableBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },

}, { timestamps: true })

export const influencerModel = mongoose.model('influencer', influencerSchema)