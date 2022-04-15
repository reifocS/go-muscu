import type { User, Workout } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Workout } from "@prisma/client";

export function getDailyWorkout({
  dateEnd,
  dateStart,
  userId,
}: {
  userId: User["id"];
  dateStart: Date;
  dateEnd: Date;
}) {
  return prisma.workout.findFirst({
    where: {
      userId,
      date: {
        gte: dateStart,
        lt: dateEnd,
      },
    },
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
    orderBy: { date: "desc" },
    include: {
      set: {
        select: {
          exercise: {
            select: {
              title: true,
            },
          },
        },
      },
    },
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
    select: {
      id: true,
      date: true,
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

export function deleteWorkout({
  id,
  userId,
}: Pick<Workout, "id"> & { userId: User["id"] }) {
  return prisma.workout.deleteMany({
    where: { id, userId },
  });
}
