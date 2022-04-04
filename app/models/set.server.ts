import type { User, Set, Workout, Exercise } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Set } from "@prisma/client";

export function getSetList({ workoutId }: { workoutId: Workout["id"] }) {
  return prisma.set.findMany({
    where: { workoutId },
    include: {
      series: true,
    },
  });
}

export function createSet({
  workoutId,
  exerciseId,
}: Pick<Set, "workoutId"> & Pick<Set, "exerciseId">) {
  return prisma.set.create({
    data: {
      exercise: {
        connect: {
          id: exerciseId,
        },
      },
      workout: {
        connect: {
          id: workoutId,
        },
      },
    },
  });
}

export function deleteSet({ id }: Pick<Set, "id">) {
  return prisma.set.deleteMany({
    where: { id },
  });
}
