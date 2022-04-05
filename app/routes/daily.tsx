import dayjs from "dayjs";
import { ActionFunction, Form, json, Link, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import { createWorkout, getDailyWorkout, Workout } from "~/models/workout.server";
import { requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

type LoaderData = {
  dailyWorkout: Workout | null
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const today = dayjs().startOf("day").toDate();

  const workout = await createWorkout({ date: today, userId });
  return redirect(`/daily/${workout.id}`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const todayMidnight = dayjs().startOf("day");
  const tomorrowMidnight = dayjs(todayMidnight.add(1))
  const dailyWorkout = await getDailyWorkout({ userId, dateStart: todayMidnight.toDate(), dateEnd: tomorrowMidnight.toDate() });
  //redirect and prevent infinite redirection
  if (dailyWorkout && !params.workoutId) {
    return redirect(`daily/${dailyWorkout.id}`)
  }
  return json<LoaderData>({ dailyWorkout });
};

export default function Index() {
  const user = useOptionalUser();
  const data = useLoaderData<LoaderData>();

  return (
    <main className="p-4">
      <div className={`${data.dailyWorkout ? "hidden" : ""}`}>
        <Form method="post">

          <button
            className="h-10 px-3 m-1 text-green-100 transition-colors duration-150 bg-green-700 rounded-lg focus:shadow-outline hover:bg-green-800"
            type="submit">Tiens, voila pour toi!</button>
        </Form>
      </div>
      <Outlet />

    </main>
  );
}
