import express from "express";
import { CreateUser, LoginUser } from "../controllers/userController.js";

export const userRouter = express.Router();

userRouter.post("/", CreateUser);
userRouter.post("/login/", LoginUser);