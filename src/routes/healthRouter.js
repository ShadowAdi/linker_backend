import express from "express";
import { healthCheck } from "../controllers/healthController.js";

export const healthRouter = express.Router();

healthRouter.get("/", healthCheck);