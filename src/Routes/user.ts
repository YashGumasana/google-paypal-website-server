import express from 'express'
const router = express.Router()
import { userController } from '../controllers'
import { userJWT } from '../helper/jwt'
// // import * as validation from '../validation'


router.get('/analyze_user_youtube', userController.analyze_user_youtube)
router.get('/updateReportByCronJob', userController.updateReportByCronJob)

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
router.get('/getUserYoutubeDetails', userController.getUserYoutubeDetails)
router.post('/updateYoutubeChannelStatus', userController.updateYoutubeChannelStatus)




export const userRouter = router