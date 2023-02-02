import type {Password, User} from "@prisma/client";
import bcrypt from "bcryptjs";
import {createExercise} from "~/models/exercise.server";

import {prisma} from "~/db.server";
import { createTag } from "./tag.server";

export type {User} from "@prisma/client";

export async function getUserById(id: User["id"]) {
    return prisma.user.findUnique({where: {id}});
}

export async function getUserByEmail(email: User["email"]) {
    return prisma.user.findUnique({where: {email}});
}

export async function createUser(email: User["email"], password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

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

    const base_exercices = ["Développé couché", "Tractions", "Squats"];

    base_exercices.map(
        async (e) => await createExercise({title: e, userId: user.id})
    );

    const base_tags = ["pectoraux", "dos", "jambes"];
    base_tags.map(async (e) => await createTag({label: e, userId: user.id}));
    
    return user;
}

export async function exportEverything(userId: string) {
    return prisma.user.findUnique({
        where: {id: userId}, include: {
            workouts: {
                include: {
                    set: {
                        include: {
                            series: true
                        }
                    }
                }
            },
            exercices: true
        }
    })
}

export async function deleteUserByEmail(email: User["email"]) {
    return prisma.user.delete({where: {email}});
}

export async function verifyLogin(
    email: User["email"],
    password: Password["hash"]
) {
    const userWithPassword = await prisma.user.findUnique({
        where: {email},
        include: {
            password: true,
        },
    });

    if (!userWithPassword || !userWithPassword.password) {
        return null;
    }

    const isValid = await bcrypt.compare(
        password,
        userWithPassword.password.hash
    );

    if (!isValid) {
        return null;
    }

    const {password: _password, ...userWithoutPassword} = userWithPassword;

    return userWithoutPassword;
}
