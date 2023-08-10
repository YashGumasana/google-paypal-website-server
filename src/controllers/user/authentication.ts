import { Request, Response } from "express";
import { apiResponse, genderStatus } from "../../common";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import { userModel } from "../../database";
// import { reqInfo } from "../helper";

const ObjectId: any = mongoose.Types.ObjectId




export const googleLogin = async (req: Request, res: Response) => {

    try {
        let body = req.body,
            otpFlag = 1,
            authToken = 0



        let [isAlready]: any = await Promise.all([
            userModel.findOne({
                email: body?.email, isActive: true
            }),

            // userModel.findOne({
            //     userName: { '$regex': body?.userName, '$options': 'i' },
            //     isActive: true
            // })
        ])

        if (!isAlready) {

            while (otpFlag == 1) {
                for (let flag = 0; flag < 1;) {
                    authToken = Math.round(Math.random() * 1000000)
                    if (authToken.toString().length == 6) {
                        flag++;
                    }

                    let isAlreadyAssign: any = await userModel.findOne({
                        userId: authToken
                    })

                    if (isAlreadyAssign?.userId != authToken) {
                        otpFlag = 0
                    }
                }

                body.userId = authToken
                let username: any = body.email.split('@')[0]

                let response: any = await new userModel({
                    email: body.email,
                    firstName: body.given_name,
                    lastName: body.family_name,
                    image: body.picture,
                    userName: username,
                    userId: body.userId,
                }).save()

                const token = jwt.sign({
                    _id: response._id,
                    status: "Login",
                    generatedOn: (new Date().getTime())
                }, process.env.JWT_TOKEN_SECRET)



                return res.status(200).json(new apiResponse(200, "Login successfully with Google", { response, token }, {}))
            }
        }
        else {
            const token = jwt.sign({
                _id: isAlready._id,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, process.env.JWT_TOKEN_SECRET)

            let response = {
                email: isAlready.email,
                firstName: isAlready.given_name,
                lastName: isAlready.family_name,
                image: isAlready.picture,
                userName: isAlready.userName,
                userId: isAlready.userId,
                userYoutubeAccessToken: true
            }
            return res.status(200).json(new apiResponse(200, "Login successfully with Google", { response, token }, {}))
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}

