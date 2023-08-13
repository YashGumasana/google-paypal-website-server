import { Request, Response } from "express"
import { apiResponse } from "../../common"
import { userModel } from "../../database"
import { spawn } from "child_process"
import path from "path"
import mongoose from "mongoose";
const ObjectId: any = mongoose.Types.ObjectId


export const youtubeSignIn = async (req: Request, res: Response) => {

    let user: any = req.headers.user

    try {

        if (user.isYoutubeSignIn) {
            return res.status(400).json(new apiResponse(400, "logging in with YouTube has already been completed", {}, {}))
        }

        let userId = user._id

        let filePath = path.join(__dirname, '../../../python/youtube_signin.py');
        filePath = filePath.replace('build\\', '');
        console.log('filePath :>> ', filePath);

        const pythonProcess = spawn('python', [filePath, userId]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python Output: ${data}`);
            // pythonProcess.kill(); // Stop the Python process
            // if (data.includes('ExpectedResponse')) {
            //     // console.log('object :>> ');
            // }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
            pythonProcess.kill();

        });

        pythonProcess.on('close', async (code) => {
            console.log(`Python Process Exited with Code: ${code}`);
            if (code === 0) {
                // await userModel.findOneAndUpdate({ _id: userId }, { isYoutubeSignIn: true }, { new: true })
                pythonProcess.kill();

                return res.status(200).json(new apiResponse(200, 'Login Successfull with Youtube', {}, {}))
            }
            else {
                return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}

export const getUserYoutubeDetails = async (req: Request, res: Response) => {
    let user: any = req.headers.user

    let response: any
    try {

        // [response] = await Promise.all([
        //     influencerModel.aggregate([
        //         { $match: match },
        //         { $sort: { createdAt: 1 } },
        //         {
        //             $lookup: {
        //                 from: "users",
        //                 let: { createdBy: "$createdBy" },
        //                 pipeline: [
        //                     {
        //                         $match: {
        //                             $expr: {
        //                                 $and: [
        //                                     {
        //                                         $eq: ['$_id', '$$createdBy']
        //                                     }
        //                                 ]
        //                             },
        //                         },
        //                     },
        //                     {

        //                         $project: { email: 1 }
        //                     }
        //                 ],
        //                 as: "user"
        //             }
        //         },
        //         {
        //             $project: { user: 1, channelTitle: 1, channelId: 1 }
        //         }
        //     ])
        // ])

        response = await userModel.findById({ _id: user._id })


        return res.status(200).json(new apiResponse(200, 'Influencer detail successfully fetch', {
            response: response,
        }, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}