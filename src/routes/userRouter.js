import express from "express";
import { healthCheck } from "../controllers/healthController.js";

export const userRouter = express.Router();

// userRouter.get("/", );