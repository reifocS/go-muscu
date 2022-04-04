import type { LoaderFunction, ActionFunction } from "remix";
import type { Set } from "~/models/set.server";
import { redirect } from "remix";
import { json, useLoaderData, useCatch, Form } from "remix";
import invariant from "tiny-invariant";
import {
  getExercise,
  deleteExercise,
  Exercise,
  updateExercise,
} from "~/models/exercise.server";
import type { Series } from "~/models/series.server";
import { requireUserId } from "~/session.server";
import dayjs from "dayjs";
import { useState } from "react";

type LoaderData = {
  exercise: Exercise & {
    set: (Set & {
      series: Series[];
      workout: {
        date: Date;
      };
    })[];
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.exerciseId, "exerciseId not found");

  const ex = await getExercise({ userId, id: params.exerciseId });
  if (!ex) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ exercise: ex });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.exerciseId, "exerciseId not found");
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
  if (_action === "edit") {
    const title = formData.get("title");

    if (typeof title !== "string") {
      return json(
        { errors: { exerciseId: "title is required" } },
        { status: 400 }
      );
    }
    return updateExercise({ title, id: params.exerciseId })
  }
  await deleteExercise({ userId, id: params.exerciseId });

  return redirect("/exercises");
};

export default function ExerciseDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <Form method="post">
        <div className="flex flex-wrap">
          <input name="title"
            key={data.exercise.id}
            className="text-md px-1 py-1 md:text-md font-bold shadow appearance-none border rounded mr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            defaultValue={data.exercise.title}></input>
          <button
            name="_action"
            className="bg-teal-600 text-white hover:text-teal-800 text-sm py-1 px-2 rounded"
            value="edit"
            type={"submit"}>edit</button>
        </div>

      </Form>
      <hr className="my-4" />
      <ul className="list-inside">
        {data.exercise.set.map((s) => {
          return (
            <li className="list-item" key={s.id}>
              <div className="font-bold">{dayjs(s.workout.date).format("DD/MM")}</div>
              <ul className="list-inside">
                {s.series.map((series) => {
                  return (
                    <li className="list-item" key={series.id}>
                      {series.repetitions}*{series.weigth}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>

      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
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
