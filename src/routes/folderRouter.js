import express from "express";
import { CheckAuth } from "../middleware/AuthCheck.js";
import {
  CreateFolder,
  GetAllFolders,
  GetFolder,
} from "../controllers/folderController.js";

export const folderRouter = express.Router();

folderRouter.post("/", CheckAuth, CreateFolder);
folderRouter.get("/", CheckAuth, GetAllFolders);
folderRouter.get("/folder/:folderId",  GetFolder);

