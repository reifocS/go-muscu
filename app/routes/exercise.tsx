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

export default function WorkoutPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex h-[calc(100vh-40px)] border-r">
        <div className="h-full w-[200px] overflow-auto">
          <Link to="new" className="block p-4 text-blue-500 lg:text-xl">
            + New exercise
          </Link>

          <hr />

          {data.exerciseList.length === 0 ? (
            <p className="p-4">No exercise yet</p>
          ) : (
            <ol>
              {data.exerciseList.map((exercise) => (
                <li key={exercise.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 lg:text-xl`
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

        <div className="overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
