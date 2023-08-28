import { Request, Response } from "express";
import { apiResponse, genderStatus } from "../../common";
import mongoose, { Document } from "mongoose";
import { basicModel } from "../../database/models/basic";
import { influencerModel } from "../../database/models/influencer";
import { vipModel } from "../../database/models/vip";
import { vvipModel } from "../../database/models/vvip";
import { planstorageModel } from "../../database/models/planstorage";

const ObjectId: any = mongoose.Types.ObjectId




export const getPaypalOrderDetails = async (req: Request, res: Response) => {

    // reqInfo(req)
    try {
        let body = req.body
        let user: any = req.headers.user
        body.createdBy = ObjectId(user._id)
        body.availableBalance = body.price
        let response: any

        const activePlans = await Promise.all([
            basicModel.findOne({ createdBy: ObjectId(user._id), isActive: true }),
            influencerModel.findOne({ createdBy: ObjectId(user._id), isActive: true }),
            vipModel.findOne({ createdBy: ObjectId(user._id), isActive: true }),
            vvipModel.findOne({ createdBy: ObjectId(user._id), isActive: true }),
        ]);

        for (const activePlan of activePlans) {
            if (activePlan && activePlan.planType !== body.planType) {
                activePlan.isActive = false;
                await activePlan.save();
                console.log(`Previous ${activePlan.planType} plan deactivated`);
            }
        }


        if (body.planType === 'basic') {
            await handleBasicPlan(body, 'basic');
        }
        else if (body.planType === 'influencer') {
            await handleInfluencerPlan(body, 'influencer');
            // response = await new influencerModel(body).save();
        }
        else if (body.planType === 'vip') {
            await handleVipPlan(body, 'vip');
            // response = await new vipModel(body).save();

        }
        else if (body.planType === 'vvip') {
            await handleVvipPlan(body, 'vvip');
            // response = await new vvipModel(body).save();
        }

        // console.log('response :>> ', response);
        const sourceCollections = [
            basicModel,
            influencerModel,
            vipModel,
            vvipModel
        ];

        sourceCollections.forEach(async (sourceCollection, index) => {
            let documents: any = await sourceCollection.find({});

            if (documents.length > 0) {
                documents.forEach(async (document: any) => {
                    let updatedDocument = null;
                    if (index === 0) {
                        updatedDocument = getBasicPlanDetails(document);
                    }
                    else if (index === 1) {
                        updatedDocument = getInfluencerPlanDetails(document);

                    }
                    else if (index === 2) {
                        updatedDocument = getVipPlanDetails(document);

                        console.log('document vip:>> ', updatedDocument);
                    }
                    else if (index === 3) {
                        updatedDocument = getVvipPlanDetails(document);
                    }

                    if (document) {
                        const loggableDocument = {
                            _id: document._id,
                            orderID: document.orderID,
                            payerID: document.payerID,
                            paymentSource: document.paymentSource,
                            facilitatorAccessToken: document.facilitatorAccessToken,
                            createdBy: document.createdBy,
                            price: document.price,
                            planType: document.planType,
                            planDuration: document.planDuration,
                            startingDate: document.startingDate,
                            expiryDate: document.expiryDate,
                            dataExpiryDate: document.dataExpiryDate,
                            // analyze: document.analyze,
                            availableBalance: document.availableBalance,
                            isActive: document.isActive,
                            isBlock: document.isBlock,
                            createdAt: document.createdAt,
                            updatedAt: document.updatedAt,
                            planSchemaNameDB: updatedDocument.planSchemaNameDB,
                            planAdditionalNotes: updatedDocument.planAdditionalNotes
                        };

                        await planstorageModel.deleteMany({});

                        await new planstorageModel(loggableDocument).save();
                    }
                    // console.log(`Inserted ${documents.length} documents from ${sourceCollection.modelName} into plan_store at index ${index}`);
                })

            }
        });
        // Loop through each collection



        return res.status(200).json(new apiResponse(200, "Payment Successfully Paid", {}, {}))

    }
    catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
    }
}


async function handleBasicPlan(body: any, planType: any) {

    const today = new Date();
    const startingDate = new Date(today);
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + Number(body.planDuration));
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    body.startingDate = startingDate
    body.expiryDate = expiryDate
    body.dataExpiryDate = sixMonthsLater

    const activePlan = await basicModel.findOne({ createdBy: ObjectId(body.createdBy), isActive: true });

    if (activePlan) {
        // Update the active plan if it's the same type
        if (activePlan.planType === planType) {
            console.log('active plan --->', planType);

            await basicModel.findOneAndUpdate({
                createdBy: ObjectId(body.createdBy), isActive: true
            }, { startingDate: startingDate, expiryDate: expiryDate, dataExpiryDate: sixMonthsLater /*,analyze: body.analyze */ }, { new: true });
        }

    } else {
        console.log('new data --->', body.planType)

        await new basicModel(body).save();
    }
}
async function handleInfluencerPlan(body: any, planType: any) {

    const today = new Date();
    const startingDate = new Date(today);
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + Number(body.planDuration));
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    body.startingDate = startingDate
    body.expiryDate = expiryDate
    body.dataExpiryDate = sixMonthsLater

    const activePlan = await influencerModel.findOne({ createdBy: ObjectId(body.createdBy), isActive: true });

    if (activePlan) {
        // Update the active plan if it's the same type
        if (activePlan.planType === planType) {

            console.log('active plan --->', planType);


            await influencerModel.findOneAndUpdate({
                createdBy: ObjectId(body.createdBy), isActive: true
            }, { startingDate: startingDate, expiryDate: expiryDate, dataExpiryDate: sixMonthsLater/*, analyze: body.analyze*/ }, { new: true });
            // console.log('Plan extended for 1 day:', response);
        }
        // Deactivate the active plan if a different type is purchased

    } else {
        console.log('new data --->', body.planType)

        await new influencerModel(body).save();
    }
}
async function handleVipPlan(body: any, planType: any) {

    const today = new Date();
    const startingDate = new Date(today);
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + Number(body.planDuration));
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    body.startingDate = startingDate
    body.expiryDate = expiryDate
    body.dataExpiryDate = sixMonthsLater

    const activePlan = await vipModel.findOne({ createdBy: ObjectId(body.createdBy), isActive: true });

    if (activePlan) {
        // Update the active plan if it's the same type
        if (activePlan.planType === planType) {
            console.log('active plan --->', planType);


            const response = await vipModel.findOneAndUpdate({
                createdBy: ObjectId(body.createdBy), isActive: true
            }, { startingDate: startingDate, expiryDate: expiryDate, dataExpiryDate: sixMonthsLater/*, analyze: body.analyze*/ }, { new: true });
        }

    } else {
        console.log('new data --->', body.planType)

        await new vipModel(body).save();
    }
}
async function handleVvipPlan(body: any, planType: any) {

    const today = new Date();
    const startingDate = new Date(today);
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + Number(body.planDuration));
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    body.startingDate = startingDate
    body.expiryDate = expiryDate
    body.dataExpiryDate = sixMonthsLater

    const activePlan = await vvipModel.findOne({ createdBy: ObjectId(body.createdBy), isActive: true });

    if (activePlan) {
        // Update the active plan if it's the same type
        if (activePlan.planType === planType) {
            console.log('active plan --->', planType);


            await vvipModel.findOneAndUpdate({
                createdBy: ObjectId(body.createdBy), isActive: true
            }, { startingDate: startingDate, expiryDate: expiryDate, dataExpiryDate: sixMonthsLater/*, analyze: body.analyze*/ }, { new: true });
        }
    } else {
        console.log('new data --->', body.planType)
        await new vvipModel(body).save();
    }
}


function getBasicPlanDetails(document: any) {
    const updatedDocument = {
        ...document,
        planSchemaNameDB: 'basicSchema',
        planAdditionalNotes: 'this is the basic plan'
    };
    return updatedDocument;

}
function getInfluencerPlanDetails(document: any) {
    const updatedDocument = {
        ...document,
        planSchemaNameDB: 'influencerSchema',
        planAdditionalNotes: 'this is the influencer plan'
    };
    return updatedDocument;
}

function getVipPlanDetails(document: any) {
    const updatedDocument = {
        ...document,
        planSchemaNameDB: 'vipSchema',
        planAdditionalNotes: 'this is the vip plan'
    };
    return updatedDocument;


}
function getVvipPlanDetails(document: any) {
    const updatedDocument = {
        ...document,
        planSchemaNameDB: 'vvipSchema',
        planAdditionalNotes: 'this is the vvip plan'
    };
    return updatedDocument;
}

// export const getPaypalOrderDetails = async (req: Request, res: Response) => {

//     // reqInfo(req)
//     try {
//         let body = req.body

//         let user: any = req.headers.user

//         body.createdBy = ObjectId(user._id)


//         const response = await new orderModel(body).save();


//         return res.status(200).json(new apiResponse(200, "Payment Successfully Paid", {}, {}))

//     }
//     catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
//     }
// }

