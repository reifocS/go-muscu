import { Form, json, useLoaderData, Outlet, Link, NavLink } from "remix";
import type { LoaderFunction } from "remix";

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
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
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
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
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

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
