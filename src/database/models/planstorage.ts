import mongoose from 'mongoose'

const planstorageSchema: any = new mongoose.Schema({

    orderID: { type: String, default: null },
    payerID: { type: String, default: null },
    paymentSource: { type: String, default: null },
    facilitatorAccessToken: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    price: { type: Number, default: null },
    planType: { type: String, default: null },

    planDuration: { type: Number, default: null },
    planSchemaNameDB: { type: String, default: null },
    planAdditionalNotes: { type: String, default: null },

    startingDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    dataExpiryDate: { type: Date, default: null },

    availableBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },

}, { timestamps: true })

export const planstorageModel = mongoose.model('planstorage', planstorageSchema)