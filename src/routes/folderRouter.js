import express from "express";
import { CheckAuth } from "../middleware/AuthCheck.js";
import {
  CreateFolder,
  DeleteFolder,
  GetAllFolders,
  GetFolder,
  UpdateFolder,
} from "../controllers/folderController.js";

export const folderRouter = express.Router();

folderRouter.post("/", CheckAuth, CreateFolder);
folderRouter.get("/", CheckAuth, GetAllFolders);
folderRouter.get("/folder/:folderId", CheckAuth, GetFolder);
folderRouter.delete("/folder/:folderId", CheckAuth, DeleteFolder);
folderRouter.patch("/folder/:folderId", CheckAuth, UpdateFolder);
