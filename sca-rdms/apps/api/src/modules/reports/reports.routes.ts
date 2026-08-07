import { Router } from "express";
import { reportsController } from "./reports.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import { upload } from "../../middleware/upload";
import { createReportSchema, updateReportSchema, approvalDecisionSchema, addCommentSchema } from "./reports.validation";

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.post("/", authorize("report", "create"), validateBody(createReportSchema), reportsController.create);
reportsRouter.get("/", authorize("report", "read"), reportsController.list);
reportsRouter.get("/:id", authorize("report", "read"), reportsController.getById);
reportsRouter.patch("/:id", authorize("report", "update"), validateBody(updateReportSchema), reportsController.update);
reportsRouter.post("/:id/submit", authorize("report", "update"), reportsController.submit);
reportsRouter.post(
  "/:id/approve",
  authorize("report", "approve"),
  validateBody(approvalDecisionSchema),
  reportsController.approve
);
reportsRouter.post(
  "/:id/reject",
  authorize("report", "reject"),
  validateBody(approvalDecisionSchema),
  reportsController.reject
);
reportsRouter.get("/:id/revisions", authorize("report", "read"), reportsController.listRevisions);
reportsRouter.post("/:id/comments", authorize("report", "read"), validateBody(addCommentSchema), reportsController.addComment);
reportsRouter.post(
  "/:id/attachments",
  authorize("report", "update"),
  upload.single("file"),
  reportsController.uploadAttachment
);
