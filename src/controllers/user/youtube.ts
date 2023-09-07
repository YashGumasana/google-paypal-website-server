import { Request, Response } from "express"
import { apiResponse } from "../../common"
import { userModel } from "../../database"
import { exec, spawn } from "child_process"
import path from "path"
import mongoose from "mongoose";
const ObjectId: any = mongoose.Types.ObjectId


export const installPackage = async (req: Request, res: Response) => {
    try {
        exec('python --version', (error, stdout, stderr) => {
            if (error) {
                console.error('Python is not installed:', error.message);
            } else {
                console.log('Python version:', stdout);
                let packageInstallPath = path.join(__dirname, '../../../requirements.txt');
                packageInstallPath = packageInstallPath.replace('build\\', '');
                packageInstallPath = packageInstallPath.replace('build/', '');
                // packageInstallPath = packageInstallPath.replace('/src', '');
                console.log('packageInstallPath', packageInstallPath)
                const installPythonDeps = spawn('pip', ['install', '-r', packageInstallPath]);

                installPythonDeps.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                });

                installPythonDeps.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                });

                installPythonDeps.on('close', (code) => {
                    if (code === 0) {
                        exec('python -c "import pymongo"', (pkgError, pkgStdout, pkgStderr) => {
                            if (pkgError) {
                                console.error('pymongo is not installed:', pkgError.message);
                            } else {
                                console.log('pymongo is installed');
                                res.send('done')
                            }
                        });
                    } else {
                        console.error(`Error: Python dependency installation failed with code ${code}`);
                        res.send('error')
                    }
                });
                // Check if the required Python package is installed
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}

export const youtubeSignIn = async (req: Request, res: Response) => {

    let user: any = req.headers.user

    try {


        // Now you can proceed to run your Python script


        let userId = user._id


        // let pythonPath = path.join(process.cwd(), 'venv', 'Scripts', 'python');
        // let pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
        // pythonPath = pythonPath.replace('/src', '');
        console.log('__dirname', __dirname)
        // console.log('pythonPath', pythonPath)

        let filePath = path.join(__dirname, '../../../python/youtube_multiple_signin.py');
        // let packageInstallPath = path.join(__dirname, '../../../python/requirements.txt');
        console.log('filePath before build :>> ', filePath);
        // if(filePath.includes())
        filePath = filePath.replace('build\\', '');
        filePath = filePath.replace('build/', '');
        // filePath = filePath.replace('/src', '');

        // packageInstallPath = packageInstallPath.replace('build\\', '');
        // packageInstallPath = packageInstallPath.replace('build/', '');

        console.log('filePath :>> ', filePath);

        // const installPythonDeps = spawn('pip', ['install', '-r', packageInstallPath]);
        // installPythonDeps.stdout.on('data', (data) => {
        //     console.log(`stdout: ${data}`);
        // });

        // installPythonDeps.stderr.on('data', (data) => {
        //     console.error(`stderr: ${data}`);
        // });

        // installPythonDeps.on('close', (code) => {
        //     if (code === 0) {

        //         // Now you can proceed to run your Python script
        //     } else {
        //         console.error(`Error: Python dependency installation failed with code ${code}`);
        //     }
        // });
        // console.log('Python dependencies installed successfully');
        // const pythonProcess = spawn('python', [filePath, userId]);
        const pythonProcess = spawn('python', [filePath, userId]);
        console.log('Python');

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