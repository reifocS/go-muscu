import type { ActionFunction, LoaderFunction } from "remix";
import { Form, json, redirect, useCatch, useLoaderData } from "remix";
import type { Set } from "~/models/set.server";
import invariant from "tiny-invariant";
import {
  deleteExercise,
  Exercise,
  getExercise,
  updateExercise,
} from "~/models/exercise.server";
import type { Series } from "~/models/series.server";
import { requireUserId } from "~/session.server";
import dayjs from "dayjs";

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
    return updateExercise({ title, id: params.exerciseId });
  }
  await deleteExercise({ userId, id: params.exerciseId });

  return redirect("/exercise");
};

export default function ExerciseDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <Form method="post">
        <div className="flex flex-wrap">
          <input
            name="title"
            key={data.exercise.id}
            className="text-md md:text-md focus:shadow-outline mr-2 appearance-none rounded border px-1 py-1 font-bold leading-tight text-gray-700 shadow focus:outline-none"
            defaultValue={data.exercise.title}
          ></input>
          <button
            name="_action"
            className="rounded py-1 px-2 text-sm text-white hover:text-teal-800"
            value="edit"
            type={"submit"}
          >
            edit
          </button>
        </div>
      </Form>
      <hr className="my-4" />
      <ul className="list-inside">
        {data.exercise.set.map((s) => {
          return (
            <li className="list-item" key={s.id}>
              <div className="font-bold">
                {dayjs(s.workout.date).format("DD/MM")}
              </div>
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
        <button type="submit" className="rounded py-2 px-4 text-white">
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
