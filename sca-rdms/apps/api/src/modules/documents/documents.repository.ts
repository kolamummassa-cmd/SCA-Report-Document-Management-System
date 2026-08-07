import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const documentsRepository = {
  create(data: Prisma.DocumentUncheckedCreateInput) {
    return prisma.document.create({ data });
  },

  findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
        programme: true,
        project: true,
        department: true,
        location: true,
        categories: true,
        tags: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          include: { file: true, uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
        },
        comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
  },

  update(id: string, data: Prisma.DocumentUncheckedUpdateInput) {
    return prisma.document.update({ where: { id }, data });
  },

  async list(where: Prisma.DocumentWhereInput, page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          author: { select: { firstName: true, lastName: true } },
          programme: { select: { name: true } },
          project: { select: { name: true } },
          department: { select: { name: true } },
          categories: true,
          tags: true,
          versions: { orderBy: { versionNumber: "desc" }, take: 1, include: { file: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.document.count({ where }),
    ]);
    return { items, totalItems };
  },

  createVersion(documentId: string, versionNumber: number, fileId: string, uploadedById: string, changeNote?: string) {
    return prisma.documentVersion.create({
      data: { documentId, versionNumber, fileId, uploadedById, changeNote },
    });
  },

  countVersions(documentId: string) {
    return prisma.documentVersion.count({ where: { documentId } });
  },

  addComment(documentId: string, authorId: string, body: string) {
    return prisma.comment.create({ data: { documentId, authorId, body } });
  },

  async upsertTagsByName(names: string[]) {
    const tags = await Promise.all(
      names.map((name) => prisma.tag.upsert({ where: { name }, update: {}, create: { name } }))
    );
    return tags.map((t) => ({ id: t.id }));
  },

  async upsertCategoriesByName(names: string[]) {
    const categories = await Promise.all(
      names.map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name } }))
    );
    return categories.map((c) => ({ id: c.id }));
  },
};
