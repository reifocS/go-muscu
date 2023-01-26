import type { Tag } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Tag } from "@prisma/client";

export function getTag({ tagId }: { tagId: string }) {
  return prisma.tag.findMany({
    where: {
      id: tagId,
    },
  });
}

export function deleteTag({ tagId }: { tagId: string }) {
  return prisma.tag.delete({
    where: {
      id: tagId,
    },
  });
}

export function createTag({ label, userId }: Omit<Tag, "id">) {
  return prisma.tag.create({
    data: {
      label,
      userId,
    },
  });
}

export function getAllTags({ userId }: { userId: string }) {
  return prisma.tag.findMany({
    where: {
      userId,
    },
  });
}
