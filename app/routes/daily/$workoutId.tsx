import type { ActionFunction, LoaderFunction } from "remix";
import { Form, json, redirect, useCatch, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { deleteWorkout, getWorkout, Workout } from "~/models/workout.server";
import { requireUserId } from "~/session.server";
import { createSet, deleteSet, Set } from "~/models/set.server";
import {
  createSeries,
  deleteSeries,
  Series,
  updateSerie,
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
  invariant(params.workoutId, "workoutId not found");

  const workout = await getWorkout({ userId, id: params.workoutId });
  const exerciseList = await getExerciseList({ userId });

  if (!workout) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ workout, exerciseList });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
  invariant(params.workoutId, "workoutId not found");

  if (_action === "delete_workout") {
    console.log(params.workoutId);
    await deleteWorkout({ userId, id: params.workoutId });
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
  if (_action === "edit_series") {
    const id = formData.get("id");
    const repetitions = formData.get("rep");
    const weigth = formData.get("weight");
    if (typeof id !== "string") {
      return json<ActionData>(
        { errors: { id: "id is required" } },
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

    return updateSerie({
      id,
      weigth: +weigth,
      repetitions: +repetitions,
    });
  }
  if (_action === "add_series") {
    const setId = formData.get("setId");
    const repetitions = formData.get("rep");
    const weigth = formData.get("weight");
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
    return createSet({ workoutId: params.workoutId, exerciseId });
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
          name="rep"
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
          name="weight"
          placeholder="weight"
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
  return (
    <>
      {" "}
      <Form method="post">
        <div className="flex flex-1 items-center justify-between">
          <h3 className="font-bold">
            {new Date(data.workout.date).toLocaleDateString()}
          </h3>
        </div>
      </Form>
      <Carrousel
        elementList={data.exerciseList.filter(
          (ex) => !data.workout.set.find((set) => set.exerciseId === ex.id)
        )}
      />
      {/*data.workout.set.map((set) => (
        <div key={set.id}>
          <div>
            {set.exercise.title}{" "}
            <Form method="post" style={{ display: "inline" }}>
              <input type="hidden" value={set.id} name="setId"></input>{" "}
              <button type="submit" name="_action" value="delete_set">
                remove
                </button>
            </Form>
          </div>
          <ul>
            {set.series.map((s) => (
              <li key={s.id}>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" value={s.id} name="id"/>
                  <input
                    name="rep"
                    placeholder="rep"
                    defaultValue={s.repetitions}
                    type="number"
                    min={0}
                  ></input>
                  <input
                    name="weight"
                    placeholder="weigth"
                    defaultValue={s.weigth}
                    type="number"
                    step="0.01"
                    min={0}
                  ></input>
                  <button type="submit" name="_action" value="edit_series">
                    edit
                    </button>{" "}
                </Form>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" value={s.id} name="id"></input>
                  <button type="submit" name="_action" value="delete_series">
                    delete
                    </button>
                </Form>
              </li>
            ))}
          </ul>
          <Form method="post">
            <input type="hidden" name="setId" value={set.id}></input>
            <input name="rep" placeholder="rep" type="number" min={0}></input>
              &nbsp;*&nbsp;
              <input
              name="weight"
              placeholder="weigth"
              type="number"
              step="0.01"
              min={0}
            ></input>{" "}
            <button type="submit" name="_action" value="add_series">
              +
              </button>
          </Form>
        </div>
      ))*/}
      {data.workout.set.map((s) => (
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
                {s.series.map((series) => (
                  <TableRow series={series} key={series.id} />
                ))}
                <AddSeries set={s} />
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

const TableHead = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 py-2 text-xs text-gray-500">Rep</th>
        <th className="px-2 py-2 text-xs text-gray-500">Weight</th>
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
