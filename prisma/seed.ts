import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function seed() {
    const email = "rachel@remix.run";

    // cleanup the existing database
    await prisma.user.delete({where: {email}}).catch(() => {
        // no worries if it doesn't exist yet
    });

    const hashedPassword = await bcrypt.hash("racheliscool", 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: {
                create: {
                    hash: hashedPassword,
                },
            },
        },
    });

    const benchPress = await prisma.exercise.create({
        data: {
            title: "Bench press",
            userId: user.id,
        },
    });

    const daysOfTraining = 60;
    let date = dayjs();
    const maxRep = 12;
    const minRep = 6;
    let currentWeigth = 80;
    let currentRep = minRep;
    const nbOfSeries = 5;
    for (let i = 0; i < daysOfTraining; ++i) {
        const workout = await prisma.workout.create({
            data: {
                userId: user.id,
                date: date.toDate(),
                duration: 0,
            },
        });
        const setBench = await prisma.set.create({
            data: {
                exerciseId: benchPress.id,
                workoutId: workout.id,
            },
        });
        for (let j = 0; j < nbOfSeries; ++j) {
            await prisma.series.create({
                data: {
                    setId: setBench.id,
                    repetitions: currentRep,
                    weigth: currentWeigth,
                },
            });
        }
        currentRep++;
        if (currentRep > maxRep) {
            currentRep = minRep;
            currentWeigth += 2.5
        }
        date = date.add(2, "day")
    }
    console.log(`Database has been seeded. 🌱`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
