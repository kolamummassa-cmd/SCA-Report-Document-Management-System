import { Router } from "express";
import { documentsController } from "./documents.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import { upload } from "../../middleware/upload";
import { createDocumentSchema, addDocumentVersionSchema, addCommentSchema } from "./documents.validation";

export const documentsRouter = Router();

documentsRouter.use(authenticate);

documentsRouter.post(
  "/",
  authorize("document", "create"),
  upload.single("file"),
  validateBody(createDocumentSchema),
  documentsController.create
);
documentsRouter.get("/", authorize("document", "read"), documentsController.list);
documentsRouter.get("/:id", authorize("document", "read"), documentsController.getById);
documentsRouter.post(
  "/:id/versions",
  authorize("document", "create"),
  upload.single("file"),
  validateBody(addDocumentVersionSchema),
  documentsController.addVersion
);
documentsRouter.delete("/:id", authorize("document", "delete"), documentsController.softDelete);
documentsRouter.post("/:id/restore", authorize("document", "delete"), documentsController.restore);
documentsRouter.post(
  "/:id/comments",
  authorize("document", "read"),
  validateBody(addCommentSchema),
  documentsController.addComment
);
