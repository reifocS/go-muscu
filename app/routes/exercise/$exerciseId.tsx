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

      <div>
        <div className="flex inline-flex w-full p-2">
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
          <div className="flex items-center justify-center p-2 underline">
            statistics <FcStatistics className="ml-1" />
          </div>
        </Link>

        <div className="pt-2">
          {data.exercise.set.map((s, i) => {
            return (
              <details key={s.id} open={i === 0}>
                <summary className="flex h-[40px] cursor-pointer items-center justify-between border-t bg-gray-700 px-5">
                  <div className="font-bold">
                    {dayjs(s.workout.date).format("DD/MM")}
                  </div>
                  <div className="text-sm italic">
                    {`Total: ${s.series.reduce(
                      (acc, s) => acc + s.weigth * s.repetitions,
                      0
                    )} kg`}
                  </div>
                </summary>

                <table className="w-full table-auto divide-y border-none">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-2 py-2 text-xs text-gray-500">
                        Repetitions
                      </th>
                      <th className="px-2 py-2 text-xs text-gray-500">Poids</th>
                      <th className="px-2 py-2 text-xs text-gray-500">Total</th>
                    </tr>
                  </thead>

                  <tbody className="text-center">
                    {s.series.map((series) => {
                      return (
                        <tr className="h-10" key={series.id}>
                          <td className="h-full px-2 py-2 text-xs">
                            {series.repetitions}
                          </td>
                          <td className="h-full px-2 py-2 text-xs">
                            {series.weigth} kg
                          </td>
                          <td className="h-full px-2 py-2 text-xs">
                            {series.repetitions * series.weigth} kg
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </details>
            );
          })}
        </div>
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
