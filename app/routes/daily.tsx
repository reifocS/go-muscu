import dayjs from "dayjs";
import { ActionFunction, LoaderFunction, useTransition } from "remix";
import { Form, json, redirect, useCatch, useLoaderData } from "remix";
import {
  deleteWorkout,
  Workout,
  createWorkout,
  getDailyWorkout,
} from "~/models/workout.server";
import { requireUserId } from "~/session.server";
import { createSet, deleteSet, Set } from "~/models/set.server";
import {
  createSeries,
  deleteSeries,
  Series,
} from "~/models/series.server";
import { getExerciseList } from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";

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
  exerciseList: Awaited<ReturnType<typeof getExerciseList>>;
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
      <td className={`h-full px-2 py-2 text-xs`}>{series.repetitions}</td>
      <td className={`h-full px-2 py-2 text-xs`}>{series.weigth}</td>
      <td className={`h-full px-2 py-2 text-xs`}>edit</td>
    </tr>
  );
};

function AddSeries({ set }: { set: Set }) {
  return (
    <tr className="h-10">
      <td className={`h-full px-2 py-2 text-xs`}>
        <input type="hidden" name="setId" value={set.id} form={set.id} />
        <input
          name="repetitions"
          placeholder="rep"
          type="number"
          form={set.id}
          className={
            "w-full rounded border border-gray-300 bg-white py-1 px-1 text-base text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          }
          min={0}
        />
      </td>
      <td className={`h-full px-2 py-2 text-xs`}>
        <input
          name="weigth"
          placeholder="poids"
          type="number"
          step="0.01"
          className="w-full rounded border border-gray-300 bg-white py-1 px-1 text-base text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          form={set.id}
          min={0}
        />
      </td>
      <td className={`h-full px-2 py-2 text-xs`}>
        <button type="submit" name="_action" form={set.id} value="add_series">
          +
        </button>
      </td>
    </tr>
  );
}

export default function WorkoutDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const transition = useTransition();
  const optimistUpdateData = transition.submission && Object.fromEntries(transition.submission.formData)
  const optimistAction = optimistUpdateData && optimistUpdateData["_action"] as string
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
          title: data.exerciseList.find(e => e.id === optimistUpdateData.exerciseId)?.title
        }
      }
    ]
  }
  return (
    <>
      {" "}
      <Form method="post">
        <h3 className="font-bold p-4">
          {new Date(data.workout.date).toLocaleDateString()}
        </h3>

      </Form>
      <Carrousel workoutId={data.workout.id} elementList={data.exerciseList} />
      {optimistWorkoutSet.map((s) => {
        let optimistSeries = s.series;
        if (optimistUpdateData &&
          optimistAction === "add_series"
          && optimistUpdateData["setId"] === s.id) {
          optimistSeries = [...optimistSeries, {
            ...optimistUpdateData as any,
            id: Math.random().toString(),
          }]
        }
        return (
          <div className="my-2" key={s.id}>
            <div className="flex items-center justify-center">
              <h3 className="mr-2 font-bold">{s.exercise.title}</h3>
              <Form method="post">
                <input type="hidden" value={s.id} name="setId"></input>{" "}
                <button
                  className="focus:shadow-outline m-1 rounded-lg bg-red-700 p-1 text-red-100 transition-colors duration-150 hover:bg-red-800"
                  type="submit"
                  name="_action"
                  value="delete_set"
                >
                  remove
              </button>
              </Form>
            </div>
            <Form className="hidden" method="post" id={s.id} />
            <div className="flex items-center justify-center">
              <table className="mt-2 table-fixed divide-y divide-gray-300 border">
                <TableHead />
                <tbody className="text-center">
                  {optimistSeries.map((series) => {
                    return (
                      <TableRow series={series} key={series.id} />
                    )
                  })}
                  <AddSeries set={s} />
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  );
}

const TableHead = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 py-2 text-xs text-gray-500">Rep</th>
        <th className="px-2 py-2 text-xs text-gray-500">Poids</th>
        <th className="px-2 py-2 text-xs text-gray-500">Action</th>
      </tr>
    </thead>
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
