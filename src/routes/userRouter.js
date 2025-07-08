import express from "express";
import {
  AuthenticatedUser,
  CreateUser,
  LoginUser,
  UpdateUser,
} from "../controllers/userController.js";
import { CheckAuth } from "../middleware/AuthCheck.js";

export const userRouter = express.Router();

userRouter.post("/", CreateUser);
userRouter.post("/login/", LoginUser);
userRouter.get("/me/", CheckAuth, AuthenticatedUser);
userRouter.patch("/me/", CheckAuth, UpdateUser);
