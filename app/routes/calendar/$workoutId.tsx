import type { ActionFunction, LoaderFunction } from "remix";
import { Form, json, Link, redirect, useCatch, useLoaderData } from "remix";
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
import { useState } from "react";
import { getExerciseList } from "~/models/exercise.server";
import Popover from "~/components/Popover";

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
    return redirect("/calendar");
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
  return (
    <Popover isOpen={true}>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex w-full justify-between">
          <h3 className="font-bold">
            {new Date(data.workout.date).toLocaleDateString()}
          </h3>
          <Link
            to=".."
            className="h-8 w-8 rounded-full bg-red-800 pt-0.5 text-center text-xl font-bold text-white hover:bg-red-900"
          >
            <span aria-hidden>x</span>
          </Link>
        </div>

        {data.workout.set.map((set) => (
          <div key={set.id} className="w-full">
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
                  <div className="table w-full">
                    <Form method="post" className="flex w-full">
                      <input type="hidden" value={s.id} name="id"></input>
                      <input
                        name="rep"
                        placeholder="rep"
                        defaultValue={s.repetitions}
                        type="number"
                        className="w-[40%] bg-gray-900"
                        min={0}
                      ></input>
                      <input
                        name="weight"
                        placeholder="weigth"
                        defaultValue={s.weigth}
                        type="number"
                        step="0.01"
                        className="w-[50%] bg-gray-900"
                        min={0}
                      ></input>
                      <button
                        type="submit"
                        name="_action"
                        value="edit_series"
                        className="w-[35px] bg-blue-600"
                      >
                        edit
                      </button>{" "}
                    </Form>
                    <Form method="post" className="flex w-[35px]">
                      <input type="hidden" value={s.id} name="id"></input>
                      <button
                        type="submit"
                        name="_action"
                        value="delete_series"
                        className="w-[35px] bg-red-700"
                      >
                        delete
                      </button>
                    </Form>
                  </div>
                </li>
              ))}
            </ul>
            <Form method="post" className="flex w-full overflow-hidden">
              <input type="hidden" name="setId" value={set.id}></input>
              <input
                name="rep"
                className="w-[40%] bg-gray-900"
                placeholder="reps"
                type="number"
                min={0}
              ></input>
              <input
                name="weight"
                placeholder="weigth"
                type="number"
                step="0.01"
                className="w-[40%] bg-gray-900"
                min={0}
              ></input>{" "}
              <button
                type="submit"
                name="_action"
                value="add_series"
                className="w-[70px] bg-blue-600"
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
                    <input
                      type="hidden"
                      name="exerciseId"
                      value={exercise.id}
                    />
                    <button type="submit" name="_action" value="add_exercise">
                      Add
                    </button>
                  </Form>
                </li>
              );
            })}
        </ul>

        <hr />

        <Form method="post">
          <button type="submit" name="_action" value="delete_workout">
            Delete
          </button>
        </Form>
      </div>
    </Popover>
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
