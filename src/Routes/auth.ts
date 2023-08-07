import express from 'express'
const router = express.Router()
import { userController } from '../controllers'
// // import * as validation from '../validation'

router.post('/googleLogin', userController.googleLogin)
// router.post('/login', validation.login, authController.login)
// router.post('/refresh_token', authController.refresh_token)




export const authRouter = router