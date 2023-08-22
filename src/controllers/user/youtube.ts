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



        let userId = user._id

        let filePath = path.join(__dirname, '../../../python/youtube_multiple_signin.py');
        filePath = filePath.replace('build\\', '');
        console.log('filePath :>> ', filePath);

        const pythonProcess = spawn('python', [filePath, userId]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python Output: ${data}`);
            if (data.includes('error')) {
                console.log('Error detected. Terminating Python process...');
                pythonProcess.kill();
            }

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
                pythonProcess.kill();

                return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
            }
        });

        pythonProcess.on('error', (error) => {
            console.error(`Python Process Error: ${error}`);
            pythonProcess.kill(); // Terminate the Python process

            // Handle any other cleanup tasks if needed
            // For example, close any open connections, release resources, etc.
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


        return res.status(200).json(new apiResponse(200, 'Youtubr detail successfully fetch', {
            response: response,
        }, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}


export const updateYoutubeChannelStatus = async (req: Request, res: Response) => {

    let channelIdToUpdate = req.body.channelId,
        user: any = req.headers.user

    // const session = await userModel.startSession();
    // session.startTransaction();

    try {
        const updateResults = await userModel.updateMany(
            { _id: user._id },
            { $set: { 'youtubeChannels.$[elem].isUse': false } },
            { arrayFilters: [{ 'elem.isUse': true }] }
        );

        const updateResult: any = await userModel.updateOne(
            { _id: user._id, 'youtubeChannels.channelId': channelIdToUpdate },
            { $set: { 'youtubeChannels.$.isUse': true } }

        );

        if (updateResult.nModified === 0) {
            return res.status(404).json(new apiResponse(404, 'User or channel not found', {}, {}));

        }

        // await session.commitTransaction();
        // session.endSession();

        return res.status(200).json(new apiResponse(200, 'Update Successfull', {}, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
    }
}