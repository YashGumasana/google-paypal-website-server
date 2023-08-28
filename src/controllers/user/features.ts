import { Request, Response } from "express"
import { apiResponse } from "../../common"
import { userModel } from "../../database"
import { spawn } from "child_process"
import path from "path"
import mongoose from "mongoose";
const ObjectId: any = mongoose.Types.ObjectId

export const save_analyze_data = async (req: Request, res: Response) => {
    try {
        const body = req.body,
            user: any = req.headers.user

        console.log('body.analyze', body.analyze)
        console.log('user._id', user._id)

        const response = await userModel.findOneAndUpdate({
            _id: ObjectId(user._id),
        }, {
            analyze: body.analyze
        }, { new: true })


        return res.status(200).json(new apiResponse(200, 'Saved successfuly', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
} 