import dayjs from "dayjs";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  Outlet,
  redirect,
  useLoaderData,
} from "remix";
import {
  createWorkout,
  getDailyWorkout,
  Workout,
} from "~/models/workout.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  dailyWorkout: Workout | null;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const today = dayjs().startOf("day").toDate();

  const workout = await createWorkout({ date: today, userId });
  return redirect(`/daily/${workout.id}`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const todayMidnight = dayjs().startOf("day");
  const tomorrowMidnight = dayjs(todayMidnight.add(1));
  let dailyWorkout = await getDailyWorkout({
    userId,
    dateStart: todayMidnight.toDate(),
    dateEnd: tomorrowMidnight.toDate(),
  });
  if (!dailyWorkout) {
    dailyWorkout = await createWorkout({
      date: todayMidnight.toDate(),
      userId,
    });
  }
  //redirect and prevent infinite redirection
  if (dailyWorkout && !params.workoutId) {
    return redirect(`daily/${dailyWorkout.id}`);
  }
  return json<LoaderData>({ dailyWorkout });
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <main className="p-4">
      <div className={`${data.dailyWorkout ? "hidden" : ""}`}>
        <Form method="post">
          <button
            className="focus:shadow-outline m-1 h-10 rounded-lg bg-green-700 px-3 text-green-100 transition-colors duration-150 hover:bg-green-800"
            type="submit"
          >
            Tiens, voila pour toi!
          </button>
        </Form>
      </div>
      <Outlet />
    </main>
  );
}
