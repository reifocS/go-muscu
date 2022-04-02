import type { LoaderFunction, ActionFunction } from "remix";
import { redirect } from "remix";
import { json, useLoaderData, useCatch, Form } from "remix";
import invariant from "tiny-invariant";
import {
  getExercise,
  deleteExercise,
  Exercise,
} from "~/models/exercise.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  exercise: Exercise;
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

  await deleteExercise({ userId, id: params.exerciseId });

  return redirect("/exercises");
};

export default function ExerciseDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.exercise.title}</h3>
      <hr className="my-4" />
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
