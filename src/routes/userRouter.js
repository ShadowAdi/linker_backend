import express from "express";
import {
  AuthenticatedUser,
  CreateUser,
  LoginUser,
} from "../controllers/userController.js";
import { CheckAuth } from "../middleware/AuthCheck.js";

export const userRouter = express.Router();

userRouter.post("/", CreateUser);
userRouter.post("/login/", LoginUser);
userRouter.get("/me/", CheckAuth, AuthenticatedUser);
