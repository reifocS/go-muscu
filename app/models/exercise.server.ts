import type { User, Exercise } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Exercise } from "@prisma/client";

export function getExerciseTitleOrdered({ userId }: { userId: User["id"] }) {
  return prisma.exercise.findMany({
    where: { userId },
    select: { title: true },
    orderBy: {
      title: "asc",
    },
  });
}

export function getExercise({
  id,
  userId,
}: Pick<Exercise, "id"> & {
  userId: User["id"];
}) {
  return prisma.exercise.findFirst({
    where: { id, userId },
    include: {
      set: {
        include: {
          series: true,
          workout: {
            select: {
              date: true,
            },
          },
        },
      },
    },
  });
}

export function getExerciseList({ userId }: { userId: User["id"] }) {
  return prisma.exercise.findMany({
    where: { userId },
    select: { id: true, title: true },
  });
}

export function createExercise({
  title,
  userId,
}: Pick<Exercise, "title"> & {
  userId: User["id"];
}) {
  return prisma.exercise.create({
    data: {
      title,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteExercise({
  id,
  userId,
}: Pick<Exercise, "id"> & { userId: User["id"] }) {
  return prisma.exercise.deleteMany({
    where: { id, userId },
  });
}
