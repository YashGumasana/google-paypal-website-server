import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { apiResponse } from "../common";
import mongoose from 'mongoose'
import { userModel } from "../database";


const ObjectId = mongoose.Types.ObjectId
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;


export const userJWT = async (req: Request, res: Response, next: NextFunction) => {

    let { authorization, userType } = req.headers,
        result: any

    // console.log('userJWT :>> ', authorization);
    if (authorization) {
        try {
            const access_token = authorization.replace(/"/g, '');
            let isverifyToken: any = jwt.verify(access_token, JWT_TOKEN_SECRET)


            // if (isverifyToken?.category != userType) {
            //     return res.status(403).json(new apiResponse(403, 'Access Denied!', {}, {}))
            // }

            result = await userModel.findOne({ _id: new ObjectId(isverifyToken._id), isActive: true })

            req.headers.user = result

            return next()
        } catch (err) {
            if (err.message == "invalid signature") {
                return res.status(403).json(new apiResponse(403, 'Do not try a different token!', {}, {}))
            }
        }
    }
    else {
        return res.status(401).json(new apiResponse(401, 'We can not find tokens in header!', {}, {}))
    }

}