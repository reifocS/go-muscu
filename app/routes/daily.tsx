import dayjs from "dayjs";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import {
  createWorkout,
  deleteWorkout,
  getDailyWorkout,
  Workout,
} from "~/models/workout.server";
import { requireUserId } from "~/session.server";
import { createSet, deleteSet, Set } from "~/models/set.server";
import { createSeries, deleteSeries, Series } from "~/models/series.server";
import { getExerciseList } from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";
import { useState } from "react";
import Popover from "~/components/Popover";
import Chronometre from "~/components/Chronometre";

type WorkoutSet = Set & {
  series: Series[];
  exercise: {
    title: string;
  };
};
type LoaderData = {
  workout: Workout & {
    set: WorkoutSet[];
  };
  exerciseList: {
    title: string;
    id: string;
  }[];
};

type ActionData = {
  errors?: {
    workoutId?: string;
    exerciseId?: string;
    setId?: string;
    rep?: string;
    weigth?: string;
    id?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const todayMidnight = dayjs().startOf("day");
  const tomorrowMidnight = dayjs(todayMidnight.add(1));

  let workout = await getDailyWorkout({
    userId,
    dateStart: todayMidnight.toDate(),
    dateEnd: tomorrowMidnight.toDate(),
  });

  if (!workout) {
    workout = (await createWorkout({
      date: todayMidnight.toDate(),
      userId,
    })) as LoaderData["workout"];
  }

  const exerciseList = await getExerciseList({ userId });

  return json<LoaderData>({ workout, exerciseList });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
  if (_action === "delete_workout") {
    const workoutId = formData.get("workoutId");
    if (!workoutId || typeof workoutId !== "string")
      throw new Error("No workout id");
    await deleteWorkout({ userId, id: workoutId });
    return redirect("/daily");
  }
  if (_action === "delete_set") {
    const setId = formData.get("setId");

    if (typeof setId !== "string") {
      return json<ActionData>(
        { errors: { exerciseId: "setId is required" } },
        { status: 400 }
      );
    }
    return deleteSet({ id: setId });
  }
  if (_action === "delete_series") {
    const id = formData.get("id");

    if (typeof id !== "string") {
      return json<ActionData>(
        { errors: { id: "id is required" } },
        { status: 400 }
      );
    }
    return deleteSeries({ id });
  }

  if (_action === "add_series") {
    const setId = formData.get("setId");
    const repetitions = formData.get("repetitions");
    const weigth = formData.get("weigth");
    if (typeof setId !== "string") {
      return json<ActionData>(
        { errors: { exerciseId: "setId is required" } },
        { status: 400 }
      );
    }
    if (typeof repetitions !== "string") {
      return json<ActionData>(
        { errors: { exerciseId: "rep is required" } },
        { status: 400 }
      );
    }
    if (typeof weigth !== "string") {
      return json<ActionData>(
        { errors: { exerciseId: "weigth is required" } },
        { status: 400 }
      );
    }
    return createSeries({ setId, repetitions: +repetitions, weigth: +weigth });
  }
  if (_action === "add_exercise") {
    const exerciseId = formData.get("exerciseId");
    if (typeof exerciseId !== "string") {
      return json<ActionData>(
        { errors: { exerciseId: "exerciseId is required" } },
        { status: 400 }
      );
    }
    const workoutId = formData.get("workoutId");
    if (!workoutId || typeof workoutId !== "string")
      throw new Error("No workout id");
    return createSet({ workoutId, exerciseId });
  }
};

const TableRow = ({ series }: { series: Series }) => {
  return (
    <tr className="h-10">
      <td className="h-full px-2 py-2 text-xs">{series.repetitions}</td>
      <td className="h-full px-2 py-2 text-xs">{series.weigth}</td>
      <td className="bg-red-700 text-red-100 transition-colors duration-150 hover:bg-red-800">
        <Form method="post">
          <input
            type="text"
            className="hidden"
            name="id"
            value={series.id}
            readOnly
          />

          <button
            className="h-[50px] w-full font-bold"
            type="submit"
            name="_action"
            value="delete_series"
          >
            x
          </button>
        </Form>
      </td>
    </tr>
  );
};

function AddSeries({ set, disabled }: { set: Set; disabled: boolean }) {
  return (
    <tr className="h-10">
      <td className="h-full px-2 py-2 text-xs">
        <input type="hidden" name="setId" value={set.id} form={set.id} />
        <input
          name="repetitions"
          placeholder="rep"
          type="number"
          form={set.id}
          className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
          min={0}
        />
      </td>
      <td className="h-full px-2 py-2 text-xs">
        <input
          name="weigth"
          placeholder="poids"
          type="number"
          step="0.01"
          className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
          form={set.id}
          min={0}
        />
      </td>
      <td className="bg-blue-500 text-blue-100 transition-colors duration-150 hover:bg-blue-600">
        <button
          type="submit"
          name="_action"
          form={set.id}
          disabled={disabled}
          value="add_series"
          className="text-lg font-bold "
        >
          +
        </button>
      </td>
    </tr>
  );
}

export default function WorkoutDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const transition = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [time, setTime] = useState<null | number>(null);
  const [min, setMin] = useState(0);
  const [sec, setSeconds] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const optimistUpdateData =
    transition.submission && Object.fromEntries(transition.submission.formData);
  const optimistAction =
    optimistUpdateData && (optimistUpdateData["_action"] as string);
  let optimistWorkoutSet = data.workout.set;
  if (optimistUpdateData && optimistAction === "add_exercise") {
    optimistWorkoutSet = [
      ...optimistWorkoutSet,
      {
        id: Math.random().toString(),
        exerciseId: optimistUpdateData.exerciseId as string,
        workoutId: data.workout.id,
        series: [],
        exercise: {
          title:
            data.exerciseList.find(
              (e) => e.id === optimistUpdateData.exerciseId
            )?.title || "",
        },
      },
    ];
  }

  const setTimeAndStore = (time: number) => {
    setTime(time);
    setLastTime(time);
  };
  return (
    <div className="w-full overflow-hidden">
      <div className={"flex items-center justify-center"}>
        <Chronometre count={time} setCount={setTime} lastTime={lastTime} />
      </div>
      <div className="overflow-hidden p-2">
        <Carrousel
          workoutId={data.workout.id}
          elementList={data.exerciseList}
        />
      </div>

      <div className="h-[calc(100vh-290px)] overflow-auto">
        {optimistWorkoutSet.map((s, i) => {
          let optimistSeries = s.series;
          if (
            optimistUpdateData &&
            optimistAction === "add_series" &&
            optimistUpdateData["setId"] === s.id
          ) {
            optimistSeries = [
              ...optimistSeries,
              {
                ...(optimistUpdateData as any),
                id: Math.random().toString(),
              },
            ];
          }

          return (
            <div className="0" key={s.id}>
              <details open={i === data.workout.set.length - 1}>
                <summary className="flex h-[60px] cursor-pointer items-center justify-between border-t-2 border-gray-500 bg-gray-700 hover:bg-gray-900">
                  <h3 className="px-5 text-lg font-bold">
                    {i}. {s.exercise.title}
                  </h3>
                  <Form method="post">
                    <input type="hidden" value={s.id} name="setId"></input>{" "}
                    <button
                      className=" focus:shadow-outline h-[60px] w-[60px] bg-red-700 text-lg font-bold text-red-100 transition-colors duration-150 hover:bg-red-800"
                      type="submit"
                      name="_action"
                      value="delete_set"
                    >
                      x
                    </button>
                  </Form>
                </summary>

                <Form className="hidden" method="post" id={s.id} />
                <div className="flex items-center justify-center">
                  <table className="w-full table-auto divide-y border-none">
                    <TableHead />
                    <TableBody
                      optimistSeries={optimistSeries}
                      disabled={transition.submission != null}
                      set={s}
                    />
                  </table>
                </div>
              </details>
            </div>
          );
        })}
      </div>

      <div className="focus:shadow-outline flex w-full items-center justify-center bg-gray-700 font-bold text-white transition-colors duration-150">
        <button className="h-[70px] w-full text-lg font-bold" onClick={open}>
          Démarrer
        </button>
      </div>
      <Popover isOpen={showDialog}>
        <div className="flex flex-col items-center justify-center">
          <button
            className="h-8 w-8 self-end rounded-full bg-red-800 pt-0.5 text-center text-xl font-bold text-white hover:bg-red-900"
            onClick={close}
          >
            <span aria-hidden>x</span>
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTimeAndStore(min * 60 + sec);
              close();
            }}
          >
            <div className="flex w-full items-center justify-center text-center text-5xl">
              <div className="w-25 mx-1 rounded-lg p-2">
                <label
                  htmlFor="minutes"
                  className="block text-sm font-medium text-gray-200"
                >
                  Minutes
                </label>
                <input
                  name="minutes"
                  value={String(min).padStart(2, "0")}
                  onChange={(e) => setMin(+e.target.value)}
                  type="number"
                  min={0}
                  className="w-full rounded bg-gray-900 text-center font-mono leading-none"
                  max={60}
                  placeholder="min"
                />
              </div>
              <div className="mx-1 text-2xl">:</div>
              <div className="w-25 mx-1 rounded-lg p-2">
                <label
                  htmlFor="seconds"
                  className="block text-sm font-medium text-gray-200"
                >
                  Seconds
                </label>
                <input
                  name="seconds"
                  value={String(sec).padStart(2, "0")}
                  onChange={(e) => setSeconds(+e.target.value)}
                  type="number"
                  className="w-full bg-gray-900 text-center font-mono leading-none"
                  min={0}
                  max={60}
                  placeholder="seconds"
                />
              </div>
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                className="m-2 rounded-full bg-gray-700 py-2 px-2 font-bold text-white"
                onClick={() => {
                  setTimeAndStore(90);
                  close();
                }}
              >
                1:30
              </button>
              <button
                type="button"
                className="m-2 rounded-full bg-gray-700  py-2 px-2 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                  setTimeAndStore(2 * 60 + 30);
                  close();
                }}
              >
                2:30
              </button>
              <button
                type="button"
                className="m-2 rounded-full bg-gray-700 py-2 px-2 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                  setTime(3 * 60 + 30);
                  close();
                }}
              >
                3:30
              </button>
            </div>

            <button
              className="
              mt-2 flex 
              w-full items-center justify-center rounded bg-gray-700 py-2 px-4
              font-bold text-white text-white"
              type="submit"
            >
              START
            </button>
          </form>
        </div>
      </Popover>
    </div>
  );
}

const TableHead = () => {
  return (
    <thead className="bg-gray-800">
      <tr>
        <th className="px-2 py-2 text-xs text-gray-500">Repetitions</th>
        <th className="px-2 py-2 text-xs text-gray-500">Poids</th>
        <th className="px-2 py-2 text-xs text-gray-500">Action</th>
      </tr>
    </thead>
  );
};

const TableBody = ({
  optimistSeries,
  disabled,
  set,
}: {
  optimistSeries: Series[];
  disabled: boolean;
  set: WorkoutSet;
}) => {
  return (
    <tbody className="text-center">
      {optimistSeries.map((series) => (
        <TableRow series={series} key={series.id} />
      ))}
      <AddSeries set={set} disabled={disabled} />
    </tbody>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
