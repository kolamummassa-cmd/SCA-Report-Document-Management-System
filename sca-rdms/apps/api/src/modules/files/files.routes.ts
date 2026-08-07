import { Router } from "express";
import { filesController } from "./files.controller";
import { authenticate } from "../../middleware/authenticate";

export const filesRouter = Router();

filesRouter.get("/:id/download", authenticate, filesController.download);
