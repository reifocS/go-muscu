import type { LoaderFunction, ActionFunction } from "remix";
import { redirect } from "remix";
import { json, useLoaderData, useCatch, Form, useTransition } from "remix";
import invariant from "tiny-invariant";
import { getWorkout, deleteWorkout, Workout } from "~/models/workout.server";
import { requireUserId } from "~/session.server";
import { Set, createSet, deleteSet } from "~/models/set.server";
import {
  createSeries,
  deleteSeries,
  Series,
  updateSerie,
} from "~/models/series.server";
import { getExerciseList } from "~/models/exercise.server";

type LoaderData = {
  workout: Workout & {
    set: (Set & {
      series: Series[];
      exercise: {
        title: string;
      };
    })[];
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
    await deleteWorkout({ userId, id: params.workoutId });
    return redirect("/workout");
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

export default function WorkoutDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const transition = useTransition();

  return (
    <div>
      <h3>
        {new Date(data.workout.date).toLocaleDateString()}
      </h3>
      {data.workout.set.map((set) => (
        <div key={set.id}>
          <div>
            {set.exercise.title}{" "}
            <Form method="post" style={{ display: "inline" }}>
              <input type="hidden" value={set.id} name="setId"></input>{" "}
              <button
                type="submit"
                name="_action"
                value="delete_set"
              >
                remove
              </button>
            </Form>
          </div>
          <ul>
            {set.series.map((s) => (
              <li key={s.id}>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" value={s.id} name="id"></input>
                  <input
                    name="rep"
                    placeholder="rep"
                    defaultValue={s.repetitions}
                    type="number" min={0}
                  ></input>
                  <input
                    name="weight"
                    placeholder="weigth"
                    defaultValue={s.weigth}
                    type="number" step="0.01" min={0}
                  ></input>
                  <button
                    type="submit"
                    name="_action"
                    value="edit_series"
                  >
                    edit
                  </button>{" "}
                </Form>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" value={s.id} name="id"></input>
                  <button
                    type="submit"
                    name="_action"
                    value="delete_series"
                  >
                    delete
                  </button>
                </Form>
              </li>
            ))}
          </ul>
          <Form method="post">
            <input type="hidden" name="setId" value={set.id}></input>
            <input
              name="rep"
              placeholder="rep"
              type="number" min={0}

            ></input>
            &nbsp;*&nbsp;
            <input
              name="weight"
              placeholder="weigth"
              type="number" step="0.01" min={0}
            ></input>{" "}
            <button
              type="submit"
              name="_action"
              value="add_series"
            >
              +
            </button>
          </Form>
        </div>
      ))}
      <br />
      <ul>
        {data.exerciseList
          .filter(
            (ex) => !data.workout.set.find((set) => set.exerciseId === ex.id)
          )
          .map((exercise) => {
            return (
              <li key={exercise.id}>
                <div>{exercise.title}</div>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <button
                    type="submit"
                    name="_action"
                    value="add_exercise"
                  >
                    Add
                  </button>
                </Form>
              </li>
            );
          })}
      </ul>

      <hr />
      <Form method="post">
        <button
          type="submit"
          name="_action"
          value="delete_workout"
        >
          Delete
        </button>
      </Form>
    </div>
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
