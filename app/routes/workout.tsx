import { Form, json, useLoaderData, Outlet, Link, NavLink } from "remix";
import type { LoaderFunction } from "remix";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getWorkoutList } from "~/models/workout.server";

type LoaderData = {
  workoutList: Awaited<ReturnType<typeof getWorkoutList>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const workoutList = await getWorkoutList({ userId });
  return json<LoaderData>({ workoutList });
};

export default function WorkoutPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New workout
          </Link>

          <hr />

          {data.workoutList.length === 0 ? (
            <p className="p-4">No workout yet</p>
          ) : (
            <ol>
              {data.workoutList.map((workout) => (
                <li key={workout.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={workout.id}
                  >
                    {new Date(workout.date).toLocaleDateString()}
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
