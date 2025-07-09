import express from "express";
import { CreateLink, GetAllLinks, GetSingleLink } from "../controllers/linkController.js";
import { CheckAuth } from "../middleware/AuthCheck.js";

export const linkRouter = express.Router();


linkRouter.get("/:folderId",CheckAuth,GetAllLinks)
linkRouter.post("/",CheckAuth,CreateLink)
linkRouter.get("/:linkId",CheckAuth,GetSingleLink)
