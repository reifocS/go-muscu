import type { LoaderFunction } from "remix";
import { json, Link, NavLink, Outlet, useLoaderData } from "remix";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getExerciseList } from "~/models/exercise.server";

type LoaderData = {
    exerciseList: Awaited<ReturnType<typeof getExerciseList>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const exerciseList = await getExerciseList({ userId });
    return json<LoaderData>({ exerciseList });
};

export default function StatisticsPage() {
    const data = useLoaderData() as LoaderData;
    const user = useUser();

    return (
        <div className="flex h-full min-h-screen flex-col">
            <main className="flex h-full">
                <div className="h-full border-r">
                    {data.exerciseList.length === 0 ? (
                        <p className="p-4">No exercise yet</p>
                    ) : (
                        <ol>
                            {data.exerciseList.map((exercise) => (
                                <li key={exercise.id}>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `block border-b p-2 lg:text-xl`
                                        }
                                        to={exercise.id}
                                    >
                                        {exercise.title}
                                    </NavLink>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
