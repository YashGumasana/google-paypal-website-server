import { Request, Response } from "express";
import { apiResponse, genderStatus } from "../../common";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import { userModel } from "../../database";
import path from 'path'
import { spawn } from 'child_process';
import { reportModel } from "../../database/models/report";
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