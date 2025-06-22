import express from "express";
import { GetAllLinks } from "../controllers/linkController";

export const linkRouter = express.Router();


linkRouter.get("/",GetAllLinks)