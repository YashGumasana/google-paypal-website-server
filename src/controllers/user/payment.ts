import { Request, Response } from "express";
import { apiResponse, genderStatus } from "../../common";
import mongoose from "mongoose";
import { basicModel } from "../../database/models/basic";
import { influencerModel } from "../../database/models/influencer";
import { vipModel } from "../../database/models/vip";
import { vvipModel } from "../../database/models/vvip";

const ObjectId: any = mongoose.Types.ObjectId




export const getPaypalOrderDetails = async (req: Request, res: Response) => {

    // reqInfo(req)
    try {
        let body = req.body
        let user: any = req.headers.user
        body.createdBy = ObjectId(user._id)
        let response: any

        const today = new Date();
        const startingDate = new Date(today);
        const expiryDate = new Date(today);
        expiryDate.setDate(expiryDate.getDate() + Number(body.planDuration));

        body.startingDate = startingDate
        body.expiryDate = expiryDate

        if (body.planType === 'basic') {
            // Set the expiry date based on the plan duration
            response = await new basicModel(body).save();
        }
        else if (body.planType === 'influencer') {
            response = await new influencerModel(body).save();
        }
        else if (body.planType === 'vip') {
            response = await new vipModel(body).save();

        }
        else if (body.planType === 'vvip') {
            response = await new vvipModel(body).save();
        }

        console.log('response :>> ', response);

        return res.status(200).json(new apiResponse(200, "Payment Successfully Paid", {}, {}))

    }
    catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}
// export const getPaypalOrderDetails = async (req: Request, res: Response) => {

//     // reqInfo(req)
//     try {
//         let body = req.body

//         let user: any = req.headers.user

//         body.createdBy = ObjectId(user._id)


//         const response = await new orderModel(body).save();


//         return res.status(200).json(new apiResponse(200, "Payment Successfully Paid", {}, {}))

//     }
//     catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
//     }
// }

