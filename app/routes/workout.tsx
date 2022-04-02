import { json, useLoaderData, Outlet, Link, NavLink } from "remix";
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
    <div>
      <main>
        {/*<div>
          <Link to="new">
            + New workout
          </Link>

          <hr />

          {data.workoutList.length === 0 ? (
            <p>No workout yet</p>
          ) : (
            <ol>
              {data.workoutList.map((workout) => (
                <li key={workout.id}>
                  <NavLink
                    to={workout.id}
                  >
                    {new Date(workout.date).toLocaleDateString()}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <Outlet />
        </div>
*/}
      </main>
    </div>
  );
}
