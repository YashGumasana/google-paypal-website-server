import mongoose from 'mongoose'

const vvipSchema: any = new mongoose.Schema({

    orderID: { type: String, default: null },
    payerID: { type: String, default: null },
    paymentSource: { type: String, default: null },
    facilitatorAccessToken: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    price: { type: Number, default: null },
    planType: { type: String, default: 'vvip' },
    planDuration: { type: Number, default: null },
    startingDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    dataExpiryDate: { type: Date, default: null },

    availableBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },

}, { timestamps: true })

export const vvipModel = mongoose.model('vvip', vvipSchema)