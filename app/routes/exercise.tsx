import type { LoaderFunction } from "remix";
import { json, Link, useFetcher, Outlet, useLoaderData } from "remix";

import { requireUserId } from "~/session.server";
import { getExerciseList } from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";

type LoaderData = {
  exerciseList: Awaited<ReturnType<typeof getExerciseList>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const exerciseList = await getExerciseList({ userId });

  return json<LoaderData>({ exerciseList });
};

export default function WorkoutPage() {
  const data = useLoaderData() as LoaderData;
  const createExerciseFetcher = useFetcher();

  return (
    <div className="h-full min-h-screen">
      <main className="h-[calc(100vh-40px)] overflow-auto">
        <div className="p-2">
          <Carrousel
            elementList={data.exerciseList}
            createExerciseFetcher={createExerciseFetcher}
            Card={Card}
          />
        </div>

        <div className="overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Card({
  el,
  itemId,
}: {
  el: { title: string; id: string };
  itemId: string;
  workoutId: string;
  createExerciseFetcher: any;
}) {
  return (
    <Link to={itemId} prefetch={"none"} className="flex">
      <button
        className="focus:shadow-outline m-1 h-[85px] w-[85px] rounded-lg bg-gray-700 font-bold
          text-white transition-colors duration-150 hover:bg-gray-800"
        value="add_exercise"
      >
        {el.title}
      </button>
    </Link>
  );
}
