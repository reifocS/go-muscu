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
    const exercises = [{title: "Bench press", start: 80, id: "0"}, {title: "Deadlift", start: 130, id: "0"}, {
        title: "Curl",
        start: 20, id: "0"
    }, {title: "Squat", start: 100, id: "0"}, {title: "Rowing", start: 60, id: "0"},]
    for (const ex of exercises) {
        const exercise = await prisma.exercise.create({
            data: {
                title: ex.title,
                userId: user.id,
            },
        });
        ex["id"] = exercise.id
    }
    const daysOfTraining = 60;
    let date = dayjs().subtract(1, "month");
    const maxRep = 12;
    const minRep = 6;
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
        for (const ex of exercises) {
            const set = await prisma.set.create({
                data: {
                    exerciseId: ex.id,
                    workoutId: workout.id,
                },
            });
            for (let j = 0; j < nbOfSeries; ++j) {
                await prisma.series.create({
                    data: {
                        setId: set.id,
                        repetitions: currentRep,
                        weigth: ex.start,
                    },
                });
            }
        }
        currentRep++;
        if (currentRep > maxRep) {
            currentRep = minRep;
            exercises.forEach(ex => ex.start += 2.5)
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
