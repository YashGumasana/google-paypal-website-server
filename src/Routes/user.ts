import express from 'express'
const router = express.Router()
import { userController } from '../controllers'
import { userJWT } from '../helper/jwt'
// // import * as validation from '../validation'


router.get('/analyze_user_youtube', userController.analyze_user_youtube)
router.get('/updateReportByCronJob', userController.updateReportByCronJob)
router.get('/installPackage', userController.installPackage)
router.get('/youtubeSignIn1', userController.youtubeSignIn1)


//subscription without jwt
router.get('/make_plan', userController.make_plan)


router.use(userJWT)

//report
router.get('/getReportsByPython', userController.getReportsByPython)
router.get('/get_all_report_of_user', userController.get_all_report_of_user)

// Paypal
router.post('/getPaypalOrderDetails', userController.getPaypalOrderDetails)

//subscription
router.get('/getActivePlan', userController.getActivePlan)

//youtube 
router.get('/youtubeSignIn', userController.youtubeSignIn)
// router.get('/installPackage', userController.installPackage)
router.get('/getUserYoutubeDetails', userController.getUserYoutubeDetails)
router.post('/updateYoutubeChannelStatus', userController.updateYoutubeChannelStatus)


//features
router.post('/save_analyze_data', userController.save_analyze_data)





export const userRouter = router