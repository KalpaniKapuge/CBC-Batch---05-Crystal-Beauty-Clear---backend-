import express from 'express';
import { createUser , loginUser, loginWithGoogle, resetPassword, sendOTP} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register",createUser);
userRouter.post("/login", loginUser);
userRouter.post("/login/google",loginWithGoogle)
userRouter.post("/send-otp",sendOTP)
userRouter.post("/reset-password",resetPassword)

export default userRouter;