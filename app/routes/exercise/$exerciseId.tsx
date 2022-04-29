import type { ActionFunction, LoaderFunction } from "remix";
import { Form, json, Link, redirect, useCatch, useLoaderData } from "remix";
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
import { FcStatistics } from "react-icons/fc";
import { AiFillDelete, AiOutlinePlus, AiFillSave } from "react-icons/ai";

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
      <Link
        to=".."
        className="inline-flex w-full items-center justify-center bg-blue-500 p-2 font-bold text-blue-100 transition-colors duration-150 hover:bg-blue-600"
      >
        <AiOutlinePlus className="mr-1" /> New exercise
      </Link>

      <div className="p-2">
        <div className="flex inline-flex w-full">
          <Form method="post">
            <button
              type="submit"
              className="focus:shadow-outline flex h-full h-[40px] w-[40px] items-center justify-center bg-red-700 text-lg font-bold text-red-100 transition-colors duration-150 hover:bg-red-800"
            >
              <AiFillDelete />
            </button>
          </Form>

          <Form method="post" className="flex inline-flex w-full">
            <input
              name="title"
              key={data.exercise.id}
              className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
              defaultValue={data.exercise.title}
            />
            <button
              name="_action"
              className="focus:shadow-outline flex h-full h-[40px] w-[50px] items-center justify-center bg-blue-500 text-lg font-bold text-blue-100 transition-colors duration-150 hover:bg-blue-600"
              value="edit"
              type={"submit"}
            >
              <AiFillSave />
            </button>
          </Form>
        </div>

        <Link to={`../../statistics/${data.exercise.id}`}>
          <div className="flex items-center justify-center underline">
            statistics <FcStatistics className="ml-1" />
          </div>
        </Link>

        <hr className="my-4" />
        <ul className="list-outside">
          {data.exercise.set.map((s) => {
            return (
              <li className="list-item" key={s.id}>
                <div className="flex justify-between font-bold">
                  <div>{dayjs(s.workout.date).format("DD/MM")}</div>
                  <div>
                    {s.series.reduce((acc, s) => {
                      return acc + s.weigth * s.repetitions;
                    }, 0)}
                    kg
                  </div>
                </div>
                <ul className="list-inside">
                  {s.series.map((series) => {
                    return (
                      <li className="list-item list-decimal" key={series.id}>
                        {series.repetitions}*{series.weigth}
                      </li>
                    );
                  })}
                </ul>
                <hr />
              </li>
            );
          })}
        </ul>
      </div>
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
