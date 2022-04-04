import type { User, Workout } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Workout } from "@prisma/client";

export function getWorkout({
  id,
  userId,
}: Pick<Workout, "id"> & {
  userId: User["id"];
}) {
  return prisma.workout.findFirst({
    where: { id, userId },
    include: {
      set: {
        include: {
          series: true,
          exercise: {
            select: { title: true },
          },
        },
      },
    },
  });
}

export function getWorkoutList({ userId }: { userId: User["id"] }) {
  return prisma.workout.findMany({
    where: { userId },
    select: { id: true, date: true },
    orderBy: { date: "desc" },
  });
}

export function createWorkout({
  date,
  userId,
}: Pick<Workout, "date"> & {
  userId: User["id"];
}) {
  return prisma.workout.create({
    data: {
      date,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteWorkout({
  id,
  userId,
}: Pick<Workout, "id"> & { userId: User["id"] }) {
  return prisma.workout.deleteMany({
    where: { id, userId },
  });
}
