import express from 'express'
const router = express.Router()
import { userController } from '../controllers'
import { userJWT } from '../helper/jwt'
// // import * as validation from '../validation'



router.use(userJWT)

router.post('/getPaypalOrderDetails', userController.getPaypalOrderDetails)




export const userRouter = router