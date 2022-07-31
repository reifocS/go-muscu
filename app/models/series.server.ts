import type {Series} from "@prisma/client";

import {prisma} from "~/db.server";

export type {Series} from "@prisma/client";

export function createSeries({
                                 setId,
                                 repetitions,
                                 weigth,
                             }: Omit<Series, "id">) {
    return prisma.series.create({
        data: {
            repetitions,
            weigth,
            set: {
                connect: {
                    id: setId,
                },
            },
        },
    });
}

export function updateSerie({
                                id,
                                repetitions,
                                weigth,
                            }: Omit<Series, "setId">) {
    return prisma.series.update({
        where: {id},
        data: {
            repetitions,
            weigth,
        },
    });
}

export function deleteSeries({id}: Pick<Series, "id">) {
    return prisma.series.deleteMany({
        where: {id},
    });
}

export function deleteAllSeries() {
    return prisma.series.deleteMany({})
}