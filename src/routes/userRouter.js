import express from "express";
import {
  AuthenticatedUser,
  CreateUser,
  DeleteUser,
  GetAllUsers,
  LoginUser,
  UpdateUser,
} from "../controllers/userController.js";
import { CheckAuth } from "../middleware/AuthCheck.js";

export const userRouter = express.Router();

userRouter.post("/", CreateUser);
userRouter.get("/", GetAllUsers);
userRouter.get("/user/:userId", GetSingleUser);
userRouter.post("/login/", LoginUser);
userRouter.get("/me/", CheckAuth, AuthenticatedUser);
userRouter.patch("/me/", CheckAuth, UpdateUser);
userRouter.delete("/me/", CheckAuth, DeleteUser);
