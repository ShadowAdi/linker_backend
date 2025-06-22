import express from "express";
import { GetAllLinks } from "../controllers/linkController.js";
import { CheckAuth } from "../middleware/AuthCheck.js";

export const linkRouter = express.Router();


linkRouter.get("/",CheckAuth,GetAllLinks)
linkRouter.post("/",CheckAuth,GetAllLinks)