import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

export const usersRouter = Router();

usersRouter.get("/", authenticate, authorize("user", "read"), usersController.list);
