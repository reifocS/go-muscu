import type { LoaderFunction, ActionFunction } from "remix";
import { redirect } from "remix";
import { json, useLoaderData, useCatch, Form } from "remix";
import invariant from "tiny-invariant";
import { getWorkout, deleteWorkout, Workout } from "~/models/workout.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  workout: Workout;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.workoutId, "workoutId not found");

  const workout = await getWorkout({ userId, id: params.workoutId });
  if (!workout) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ workout });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.workoutId, "workoutId not found");
  console.log(params.workoutId)

  await deleteWorkout({ userId, id: params.workoutId });

  return redirect("/workout");
};

export default function WorkoutDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.workout.date}</h3>
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
