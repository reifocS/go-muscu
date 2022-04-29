import dayjs from "dayjs";
import {
  ActionFunction,
  json,
  Link,
  LoaderFunction,
  useCatch,
  useFetcher,
  useLoaderData,
  useTransition,
} from "remix";
import {
  createWorkout,
  getDailyWorkout,
  getWorkout,
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
import { Fetcher } from "@remix-run/react/transition";
import { AiFillDelete, AiOutlinePlus } from "react-icons/ai";

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
  isPastWorkout: boolean;
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

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const workoutId = url.searchParams.get("workoutId");
  const todayMidnight = dayjs().startOf("day");
  const tomorrowMidnight = dayjs(todayMidnight.add(1));

  let workout;
  if (workoutId) {
    workout = await getWorkout({ userId, id: workoutId });
  } else {
    workout = await getDailyWorkout({
      userId,
      dateStart: todayMidnight.toDate(),
      dateEnd: tomorrowMidnight.toDate(),
    });
  }
  if (!workout) {
    workout = (await createWorkout({
      date: todayMidnight.toDate(),
      userId,
    })) as LoaderData["workout"];
  }

  const exerciseList = await getExerciseList({ userId });

  return json<LoaderData>({
    workout,
    exerciseList,
    isPastWorkout: !!workoutId && !todayMidnight.isSame(workout.date, "day"),
  });
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
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

const TableRow = ({
  series,
  deleteSeriesFetcher,
}: {
  series: Series;
  deleteSeriesFetcher: any;
}) => {
  return (
    <tr className="h-10">
      <td className="h-full px-2 py-2 text-xs">{series.repetitions}</td>
      <td className="h-full px-2 py-2 text-xs">{series.weigth}</td>
      <td className="bg-red-700 text-red-100 transition-colors duration-150 hover:bg-red-800">
        <deleteSeriesFetcher.Form method="post">
          <input
            type="text"
            className="hidden"
            name="id"
            value={series.id}
            readOnly
          />

          <button
            className="flex h-[50px] w-full items-center justify-center font-bold"
            type="submit"
            name="_action"
            value="delete_series"
          >
            <AiFillDelete />
          </button>
        </deleteSeriesFetcher.Form>
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
          className="flex w-full items-center justify-center text-lg font-bold"
        >
          <AiOutlinePlus />
        </button>
      </td>
    </tr>
  );
}

export default function WorkoutDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const [showDialog, setShowDialog] = useState(false);
  const [time, setTime] = useState<null | number>(null);
  const [min, setMin] = useState(0);
  const [sec, setSeconds] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const transition = useTransition();
  const deleteSetFetcher = useFetcher();
  const deleteSeriesFetcher = useFetcher();
  const createSeriesFetcher = useFetcher();
  const createExerciseFetcher = useFetcher();

  const setTimeAndStore = (time: number) => {
    setTime(time);
    setLastTime(time);
  };
  return (
    <div className="w-full overflow-hidden">
      {data.isPastWorkout && (
        <div className="mt-2 text-center font-bold">
          <h2>Séance du {dayjs(data.workout.date).format("YYYY/MM/DD")}</h2>
        </div>
      )}

      <div className="p-2">
        <Carrousel
          workoutId={data.workout.id}
          elementList={data.exerciseList}
          createExerciseFetcher={createExerciseFetcher}
          Card={Card}
        />
      </div>

      <div
        className={`${
          data.isPastWorkout ? "h-[calc(100vh-190px)]" : "h-[calc(100vh-240px)]"
        } overflow-auto`}
      >
        {data.workout.set.map((s, i) => {
          return (
            <div className="0" key={s.id}>
              <details open={i === data.workout.set.length - 1}>
                <summary className="flex h-[60px] cursor-pointer items-center justify-between border-t-2 border-gray-500 bg-gray-700">
                  <h3 className="px-5 text-lg font-bold">
                    {i}. {s.exercise.title}
                  </h3>
                  <deleteSetFetcher.Form method="post">
                    <input type="hidden" value={s.id} name="setId" />{" "}
                    <button
                      className="focus:shadow-outline flex h-full h-[60px] w-[60px] items-center justify-center bg-red-700 text-lg font-bold text-red-100 transition-colors duration-150 hover:bg-red-800"
                      type="submit"
                      name="_action"
                      value="delete_set"
                    >
                      <AiFillDelete />
                    </button>
                  </deleteSetFetcher.Form>
                </summary>

                <createSeriesFetcher.Form
                  className="hidden"
                  method="post"
                  id={s.id}
                />
                <div className="flex items-center justify-center">
                  <table className="w-full table-auto divide-y border-none">
                    <TableHead />
                    <TableBody
                      optimistSeries={s.series}
                      disabled={transition.submission != null}
                      set={s}
                      deleteSeriesFetcher={deleteSeriesFetcher}
                    />
                  </table>
                </div>
                <div className={"flex items-center justify-center"}>
                  <Link
                    className={
                      "p-3 text-blue-600 underline visited:text-purple-600"
                    }
                    to={`/exercise/${s.exerciseId}`}
                  >
                    Go to exercise
                  </Link>
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {!data.isPastWorkout && (
        <div className="focus:shadow-outline flex w-full items-center justify-center bg-gray-700 font-bold text-white transition-colors duration-150">
          <button className="h-[70px] w-full text-lg font-bold" onClick={open}>
            <Chronometre count={time} setCount={setTime} />
          </button>
        </div>
      )}

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
                className="m-2 rounded-full bg-gray-700 py-2 px-2 font-bold text-white hover:bg-gray-800"
                onClick={() => {
                  setTimeAndStore(3 * 60 + 30);
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
  deleteSeriesFetcher,
}: {
  optimistSeries: Series[];
  disabled: boolean;
  set: WorkoutSet;
  deleteSeriesFetcher: Fetcher;
}) => {
  return (
    <tbody className="text-center">
      {optimistSeries.map((series) => (
        <TableRow
          series={series}
          key={series.id}
          deleteSeriesFetcher={deleteSeriesFetcher}
        />
      ))}
      <AddSeries set={set} disabled={disabled} />
    </tbody>
  );
};

function Card({
  el,
  itemId,
  workoutId,
  createExerciseFetcher,
}: {
  el: { title: string; id: string };
  itemId: string;
  workoutId: string;
  createExerciseFetcher: any;
}) {
  return (
    <createExerciseFetcher.Form
      key={itemId}
      method="post"
      tabIndex={0}
      className="flex"
    >
      <input type="hidden" name="exerciseId" value={el.id} />
      <input type="hidden" name="workoutId" value={workoutId} />
      <button
        type="submit"
        name="_action"
        className="focus:shadow-outline m-1 h-[85px] w-[85px] rounded-lg bg-gray-700 font-bold
          text-white transition-colors duration-150 hover:bg-gray-800"
        value="add_exercise"
      >
        {el.title}
      </button>
    </createExerciseFetcher.Form>
  );
}

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
