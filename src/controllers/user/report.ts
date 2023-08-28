import { Request, Response } from "express";
import { apiResponse, genderStatus } from "../../common";
// import bcryptjs from 'bcryptjs'
// import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
// import { userModel } from "../../database";
import path from 'path'
import { spawn } from 'child_process';
import { reportModel } from "../../database/models/report";
import { planstorageModel } from "../../database/models/planstorage";
import { basicModel } from "../../database/models/basic";
import { influencerModel } from "../../database/models/influencer";
import { vipModel } from "../../database/models/vip";
import { vvipModel } from "../../database/models/vvip";
// import { reqInfo } from "../helper";

const ObjectId: any = mongoose.Types.ObjectId




export const getReportsByPython = async (req: Request, res: Response) => {

    try {
        let user: any = req.headers.user

        if (!user.userYoutubeAccessToken) {

            let userId = user._id

            let report: any = await new reportModel({}).save()
            let reportId = report._id

            let filePath = path.join(__dirname, '../../../python/create_report.py');
            filePath = filePath.replace('build\\', '');
            console.log('filePath :>> ', filePath);
            // const quotedFilePath = `"${filePath}"`;

            // exec(`python ${quotedFilePath}`, (error, stdout) => {
            //     if (error) {
            //         console.error('Error executing Python script:', error);
            //         res.status(500).send('Error generating report');
            //     } else {
            //         console.log('stdout :>> ', stdout);
            //         res.send(stdout);
            //     }
            // })
            // console.log('object :>> ', quotedFilePath);
            const pythonProcess = spawn('python', [filePath, userId, reportId]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`Python Output: ${data}`);
                if (data.includes('ExpectedResponse')) {
                    console.log('object :>> ');
                    pythonProcess.kill(); // Stop the Python process
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Python Error: ${data}`);
                pythonProcess.kill();

            });

            pythonProcess.on('close', (code) => {
                console.log(`Python Process Exited with Code: ${code}`);
                if (code === 0) {
                    return res.status(200).json(new apiResponse(200, 'Success', {}, {}))
                }
                else {
                    res.send('error')
                }
            });
        }
        else {
            return res.status(200).json(new apiResponse(200, 'Already Registre', {}, {}))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }

}


export const updateReportByCronJob = async (req: Request, res: Response) => {
    try {
        let filePath = path.join(__dirname, '../../../python/update_report.py');
        filePath = filePath.replace('build\\', '');
        console.log('filePath :>> ', filePath);
        // const quotedFilePath = `"${filePath}"`;
        const pythonProcess = spawn('python', [filePath]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python Output: ${data}`);
            if (data.includes('ExpectedResponse')) {
                console.log('object :>> ');
                pythonProcess.kill(); // Stop the Python process
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
            pythonProcess.kill();

        });

        pythonProcess.on('close', (code) => {
            console.log(`Python Process Exited with Code: ${code}`);
            if (code === 0) {
                return res.status(200).json(new apiResponse(200, 'Success', {}, {}))
            }
            else {
                res.send('error')
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}


export const analyze_user_youtube = async (req: Request, res: Response) => {

    let match = {
        isActive: true
    }

    try {

        const activePlans: any = await Promise.all([
            planstorageModel.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: "users",
                        let: { createdBy: "$createdBy" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$_id', '$$createdBy']
                                            },
                                            {
                                                $eq: ['$isYoutubeSignIn', true] // Filter for users with isYoutubeSignIn:true
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    firstName: 1,
                                    lastName: 1,
                                    userName: 1,
                                    email: 1,
                                    image: 1,
                                    userId: 1,
                                    isActive: 1,
                                    isBlock: 1,
                                    analyze: 1,
                                    youtubeChannels: {
                                        $filter: {
                                            input: '$youtubeChannels',
                                            as: 'channel',
                                            cond: { $eq: ['$$channel.isUse', true] } // Filter channels with isUse:true
                                        }
                                    }
                                }
                            }
                        ],
                        as: 'userDetails'
                    }
                }
            ])
        ]);


        // return res.status(200).json(new apiResponse(200, 'success', activePlans, {}))




        if (activePlans[0].length > 0) {

            try {
                for (const activePlan of activePlans[0]) {

                    // console.log('activePlan :>> ', activePlan);

                    let createdBy = activePlan.createdBy,
                        channelId = activePlan.userDetails[0].youtubeChannels[0].channelId,
                        analyze = activePlan.userDetails[0].analyze

                    console.log('createdBy :>> ', createdBy);
                    console.log('channelId :>> ', channelId);
                    console.log('analyze :>> ', analyze);

                    const userAvailableBalance = activePlan.availableBalance;
                    if (userAvailableBalance >= 0.1) {

                        const pythonScripts = {
                            demographics: 'analyze_demographics.py',
                            viewCounts: 'analyze_viewCounts.py',
                            myVideos: 'analyze_myVideos.py',
                            adRevenue: 'analyze_adRevenue.py',
                            trends: 'analyze_trends.py'
                        };
                        const scriptsToRun = [];

                        // Determine which scripts to run based on the analyzeConfig
                        Object.keys(analyze).forEach(async flag => {
                            if (analyze[flag] && pythonScripts[flag]) {
                                console.log('analyze', analyze)
                                console.log('flag', flag)


                                console.log('pythonScripts[flag]', pythonScripts[flag])
                                scriptsToRun.push(pythonScripts[flag]);
                                console.log('scriptsToRun', scriptsToRun)
                            }
                        });


                        console.log('scriptsToRun', scriptsToRun)

                        if (scriptsToRun.length > 0) {
                            const promises = scriptsToRun.map(async (script) => {
                                activePlan.availableBalance -= 0.1;

                                await planstorageModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { availableBalance: activePlan.availableBalance })
                                // Update the totalCost in the corresponding schema collection
                                const planType = activePlan.planType;
                                switch (planType) {
                                    case 'basic':
                                        await basicModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { availableBalance: activePlan.availableBalance });
                                        break;
                                    case 'influencer':
                                        await influencerModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { availableBalance: activePlan.availableBalance });
                                        break;
                                    case 'vip':
                                        await vipModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { availableBalance: activePlan.availableBalance });
                                        break;
                                    case 'vvip':
                                        await vvipModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { availableBalance: activePlan.availableBalance });
                                        break;
                                    default:
                                        // Handle other plan types if needed
                                        break;
                                }
                                let report = await new reportModel({}).save();
                                let reportId = report._id;

                                let filePath = path.join(__dirname, `../../../python/analyze/${script}`);
                                filePath = filePath.replace('build\\', '');
                                console.log(`Running script: ${script}`);

                                const pythonProcess = spawn('python', [filePath, createdBy, channelId, reportId]);

                                return new Promise((resolve, reject) => {
                                    pythonProcess.on('error', (error) => {
                                        console.error(`Python Process Error: ${error}`);
                                        pythonProcess.kill();
                                        reject(`Python Process Error: ${error}`);
                                    });

                                    pythonProcess.stdout.on('data', (data) => {
                                        console.log(`Python Output: ${data}`);
                                        if (data.includes('error')) {
                                            console.log('Error detected. Terminating Python process...');
                                            pythonProcess.kill();
                                            reject('Error detected in Python output');
                                        }
                                    });

                                    pythonProcess.stderr.on('data', (data) => {
                                        console.error(`Python Error: ${data}`);
                                        pythonProcess.kill();
                                        reject(`Python Error: ${data}`);
                                    });

                                    pythonProcess.on('close', async (code) => {
                                        console.log(`Python Process Exited with Code: ${code}`);
                                        if (code === 0) {
                                            pythonProcess.kill();
                                            resolve(`${script} running successfully`);
                                        } else {
                                            pythonProcess.kill();
                                            reject(`Python Internal Server Error`);
                                        }
                                    });
                                });
                            });

                            // try {
                            const results = await Promise.all(promises);
                            // return res.status(200).json(new apiResponse(200, 'results.join()', {}, {}));
                            // } catch (error) {
                            //     console.error(error);
                            //     return res.status(500).json(new apiResponse(500, 'Error while running Python scripts', {}, {}));
                            // }
                        } else {
                            return res.status(200).json(new apiResponse(200, 'No analysis done', {}, {}));
                        }

                        return res.status(200).json(new apiResponse(200, 'Scripts executed successfully', {}, {}));
                    }
                    else {
                        await planstorageModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { isActive: false })
                        // Update the totalCost in the corresponding schema collection
                        const planType = activePlan.planType;
                        switch (planType) {
                            case 'basic':
                                await basicModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { isActive: false });
                                break;
                            case 'influencer':
                                await influencerModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { isActive: false });
                                break;
                            case 'vip':
                                await vipModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { isActive: false });
                                break;
                            case 'vvip':
                                await vvipModel.findOneAndUpdate({ createdBy: createdBy, isActive: true }, { isActive: false });
                                break;
                            default:
                                // Handle other plan types if needed
                                break;
                        }
                        return res.status(200).json(new apiResponse(200, 'Plan is Expired', {}, {}));

                    }
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json(new apiResponse(500, 'Error while running Python scripts', {}, {}));
            }
        }
        else {
            return res.status(200).json(new apiResponse(200, 'No plan detected', {}, {}));

        }



        // return res.status(200).json(new apiResponse(200, 'success', activePlans, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
    }
}


export const get_all_report_of_user = async (req: Request, res: Response) => {
    let user: any = req.headers.user
    try {

        // const userIdString = user._id.toString();
        const report = await reportModel.find({ createdBy: ObjectId(user._id) }).sort({ createdAt: -1 });
        return res.status(200).json(new apiResponse(200, 'success', { report }, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
    }
}