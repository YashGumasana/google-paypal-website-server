import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { planstorageModel } from "../../database/models/planstorage";
import mongoose from "mongoose";
const ObjectId: any = mongoose.Types.ObjectId


export const getActivePlan = async (req: Request, res: Response) => {
    try {

        let user: any = req.headers.user
        const response = await planstorageModel.findOne({ createdBy: ObjectId(user._id), isActive: true })

        // console.log('response :>> ', response);

        if (response) {

            return res.status(200).json(new apiResponse(200, "Successfully get active plan", { response }, {}))
        }
        else {
            return res.status(200).json(new apiResponse(200, "Successfully get active plan", {}, {}))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}