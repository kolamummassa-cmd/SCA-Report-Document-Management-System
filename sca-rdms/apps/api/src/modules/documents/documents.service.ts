import { documentsRepository } from "./documents.repository";
import { filesService, type IncomingFile } from "../files/files.service";
import { AppError } from "../../middleware/error-handler";
import type { CreateDocumentInput } from "@sca-rdms/shared-schemas";

interface AuthUser {
  id: string;
  roleId: string;
  email: string;
}

export const documentsService = {
  async createDocument(input: CreateDocumentInput, file: IncomingFile | undefined, user: AuthUser) {
    if (!file) {
      throw new AppError("A file is required to create a document.", 400);
    }

    const { tags = [], categories = [], ...rest } = input;
    const [tagRefs, categoryRefs] = await Promise.all([
      documentsRepository.upsertTagsByName(tags),
      documentsRepository.upsertCategoriesByName(categories),
    ]);

    const fileRecord = await filesService.storeUpload(file, user.id);

    const document = await documentsRepository.create({
      ...rest,
      authorId: user.id,
      status: "ACTIVE",
      tags: { connect: tagRefs },
      categories: { connect: categoryRefs },
    } as Parameters<typeof documentsRepository.create>[0]);

    await documentsRepository.createVersion(document.id, 1, fileRecord.id, user.id, "Initial upload");

    return documentsRepository.findById(document.id);
  },

  async getDocument(id: string) {
    const document = await documentsRepository.findById(id);
    if (!document) throw new AppError("Document not found.", 404);
    return document;
  },

  async addVersion(documentId: string, file: IncomingFile, user: AuthUser, changeNote?: string) {
    const existing = await documentsRepository.findById(documentId);
    if (!existing) throw new AppError("Document not found.", 404);
    if (existing.status === "DELETED") {
      throw new AppError("Cannot add a version to a deleted document. Restore it first.", 409);
    }

    const fileRecord = await filesService.storeUpload(file, user.id);
    const nextVersion = (await documentsRepository.countVersions(documentId)) + 1;
    await documentsRepository.createVersion(documentId, nextVersion, fileRecord.id, user.id, changeNote);

    return documentsRepository.findById(documentId);
  },

  async listDocuments(filters: {
    documentType?: string;
    programmeId?: string;
    projectId?: string;
    departmentId?: string;
    year?: number;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 25, 100);

    const where: Record<string, unknown> = { status: filters.status ?? "ACTIVE" };
    if (filters.documentType) where.documentType = filters.documentType;
    if (filters.programmeId) where.programmeId = filters.programmeId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.year) where.year = filters.year;

    const { items, totalItems } = await documentsRepository.list(where, page, pageSize);
    return {
      data: items,
      meta: { page, pageSize, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)) },
    };
  },

  async softDelete(id: string) {
    const existing = await documentsRepository.findById(id);
    if (!existing) throw new AppError("Document not found.", 404);
    return documentsRepository.update(id, { status: "DELETED" });
  },

  async restore(id: string) {
    const existing = await documentsRepository.findById(id);
    if (!existing) throw new AppError("Document not found.", 404);
    return documentsRepository.update(id, { status: "ACTIVE" });
  },

  async addComment(documentId: string, user: AuthUser, body: string) {
    const existing = await documentsRepository.findById(documentId);
    if (!existing) throw new AppError("Document not found.", 404);
    return documentsRepository.addComment(documentId, user.id, body);
  },
};
