import { Request, Response } from "express";
import { apiResponse, genderStatus } from "../../common";
import mongoose from "mongoose";
import { orderModel } from "../../database/models/order";
// import { reqInfo } from "../helper";

const ObjectId: any = mongoose.Types.ObjectId




export const getPaypalOrderDetails = async (req: Request, res: Response) => {

    // reqInfo(req)
    try {
        let body = req.body

        let user: any = req.headers.user

        body.createdBy = ObjectId(user._id)


        const response = await new orderModel(body).save();


        return res.status(200).json(new apiResponse(200, "Payment Successfully Paid", {}, {}))

    }
    catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}

