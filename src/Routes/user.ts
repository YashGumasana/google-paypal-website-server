import express from 'express'
const router = express.Router()
import { userController } from '../controllers'
import { userJWT } from '../helper/jwt'
// // import * as validation from '../validation'



router.get('/updateReportByCronJob', userController.updateReportByCronJob)

router.use(userJWT)
router.get('/getReportsByPython', userController.getReportsByPython)
router.post('/getPaypalOrderDetails', userController.getPaypalOrderDetails)


router.get('/youtubeSignIn', userController.youtubeSignIn)
router.get('/getUserYoutubeDetails', userController.getUserYoutubeDetails)




export const userRouter = router