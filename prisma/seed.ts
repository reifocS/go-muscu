import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
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

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const workout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: new Date(),
      duration: 0,
    }
  })


  const benchPress = await prisma.exercise.create({
    data: {
      title: "Bench press",
      userId: user.id
    }
  })

  const setBench = await prisma.set.create({
    data: {
      exerciseId: benchPress.id,
      workoutId: workout.id
    }
  })

  await prisma.series.create({
    data: {
      setId: setBench.id,
      repetitions: 10,
      weigth: 90
    }
  })
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
