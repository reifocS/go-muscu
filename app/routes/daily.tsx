import dayjs from "dayjs";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  useCatch,
  useFetcher,
  useLoaderData,
  useSubmit,
  useTransition,
} from "remix";
import {
  addTagToWorkout,
  createWorkout,
  getDailyWorkout,
  getWorkout,
  getWorkoutList,
  Workout,
} from "~/models/workout.server";
import { requireUserId } from "~/session.server";
import { addNote, createSet, deleteSet, Set } from "~/models/set.server";
import { createSeries, deleteSeries, Series } from "~/models/series.server";
import {
  getExerciseList,
  getExerciseListContains,
} from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";
import { AiFillDelete } from "react-icons/ai";
import { GiNotebook } from "react-icons/gi";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GoLinkExternal } from "react-icons/go";
import { a, useTransition as useSpringTransition } from "@react-spring/web";
import { createTag, getAllTags } from "~/models/tag.server";
import { Exercise, Tag } from "@prisma/client";
import Card from "~/components/Card";
import TableBody from "~/components/TableWorkoutDaily/TableBody";
import TableHead from "~/components/TableWorkoutDaily/TableHead";
import SeriesNote from "~/components/SeriesNote";

export type WorkoutSet = Set & {
  series: Series[];
  exercise: {
    title: string;
  };
};
type LoaderData = {
  workout: Workout & {
    set: WorkoutSet[];
  };
  exerciseList: {
    title: string;
    id: string;
  }[];
  isPastWorkout: boolean;
  exerciseQuery: string | null;
  tags: Tag[];
  lastSeanceWithTheSameTag:
    | (Workout & {
        set: (Set & {
          series: Series[];
          exercise: Exercise;
        })[];
      })
    | undefined;
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

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const workoutId = url.searchParams.get("workoutId");
  let exerciseQuery = url.searchParams.get("exerciseQuery");
  const todayMidnight = dayjs().startOf("day");
  const tomorrowMidnight = dayjs(todayMidnight.add(1));

  let workout:
    | (Workout & {
        set: WorkoutSet[];
      })
    | null;
  if (workoutId) {
    workout = await getWorkout({ userId, id: workoutId });
  } else {
    workout = await getDailyWorkout({
      userId,
      dateStart: todayMidnight.toDate(),
      dateEnd: tomorrowMidnight.toDate(),
    });
  }
  if (!workout) {
    workout = (await createWorkout({
      date: todayMidnight.toDate(),
      userId,
    })) as LoaderData["workout"];
  }

  let exerciseList;
  if (exerciseQuery) {
    exerciseList = await getExerciseListContains({
      userId,
      title: exerciseQuery,
    });
  } else {
    exerciseList = await getExerciseList({ userId });
  }

  let tags = await getAllTags({ userId });
  let workouts = await getWorkoutList({ userId });
  const lastSeanceWithTheSameTag = workouts.find(
    (w) =>
      w.tagId === workout?.tagId &&
      w.id !== workout?.id &&
      dayjs(w.date).isBefore(dayjs(workout.date))
  );
  return json<LoaderData>({
    workout,
    exerciseList,
    isPastWorkout: !!workoutId && !todayMidnight.isSame(workout.date, "day"),
    exerciseQuery,
    tags,
    lastSeanceWithTheSameTag,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const id = await requireUserId(request);
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);

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
  if (_action === "add_series") {
    const setId = formData.get("setId");
    const repetitions = formData.get("repetitions");
    const weigth = formData.get("weigth");
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
    const workoutId = formData.get("workoutId");
    if (!workoutId || typeof workoutId !== "string")
      throw new Error("No workout id");
    return createSet({ workoutId, exerciseId });
  }
  if (_action === "add_note") {
    const setId = formData.get("setId");
    if (typeof setId !== "string") {
      return json<ActionData>(
        { errors: { setId: "setId is required" } },
        { status: 400 }
      );
    }
    const note = formData.get("note");
    if (!note || typeof note !== "string") throw new Error("Note is empty");
    return addNote(setId, note);
  }
  if (_action === "add_tag") {
    const label = formData.get("label");
    if (!label || typeof label !== "string") throw new Error("label is empty");
    return createTag({ label, userId: id });
  }
  if (_action === "associate_tag") {
    const tagId = formData.get("tag_id");
    const workoutId = formData.get("workout_id");
    if (!workoutId || typeof workoutId !== "string")
      throw new Error("No workout id");
    if (!tagId || typeof tagId !== "string") throw new Error("tagId is empty");
    return addTagToWorkout({ workoutId, tagId });
  }
};

export default function WorkoutDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const transition = useTransition();
  const deleteSetFetcher = useFetcher();
  const deleteSeriesFetcher = useFetcher();
  const createSeriesFetcher = useFetcher();
  const createExerciseFetcher = useFetcher();
  const associateTagFetcher = useFetcher();
  const createTagFetcher = useFetcher();
  const [showDialog, setShowDialog] = useState<{ open: boolean; set?: Set }>({
    open: false,
    set: undefined,
  });
  const open = (s: Set) => setShowDialog({ open: true, set: s });
  const close = useCallback(
    () => setShowDialog({ open: false, set: undefined }),
    []
  );
  const transitions = useSpringTransition(data.workout.set, {
    keys: (s: WorkoutSet) => s.id,
    from: { opacity: 0.5 },
    enter: { opacity: 1 },
  });
  const submit = useSubmit();

  const tagFormRef = useRef<HTMLFormElement | null>(null);
  let isAddingTag =
    createTagFetcher.state === "submitting" &&
    createTagFetcher.submission.formData.get("_action") === "add_tag";

  useEffect(() => {
    if (!isAddingTag) {
      tagFormRef.current?.reset();
    }
  }, [isAddingTag]);

  const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget, { method: "get", replace: true });
  };

  let volumeTotal = computeTotalVolume(data.workout);
  let volumeTotalLastSeance = data.lastSeanceWithTheSameTag
    ? computeTotalVolume(data.lastSeanceWithTheSameTag)
    : 0;
  return (
    <div className="w-full overflow-hidden">
      {data.isPastWorkout && (
        <div className="mt-2 text-center font-bold">
          <h2>Séance du {dayjs(data.workout.date).format("YYYY/MM/DD")}</h2>
        </div>
      )}
      <p className="flex items-center justify-center">
        Tag: {data.tags.find((t) => t.id === data.workout.tagId)?.label}
      </p>
      <div className={"flex justify-center"}>
        <createTagFetcher.Form
          method="post"
          ref={tagFormRef}
          className={
            "mt-2 flex max-w-[300px] items-center justify-center gap-2 p-2"
          }
        >
          <input
            required
            className={
              "block h-[30px] w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            }
            name="label"
          />
          <input
            name={"_action"}
            value={"add_tag"}
            className="hidden"
            readOnly
          />
          <button>Ajouter un nouveau tag</button>
        </createTagFetcher.Form>
      </div>
      <div>
        <ul className="flex items-center justify-center gap-2">
          {data.tags.map((t) => (
            <li key={t.id}>
              <associateTagFetcher.Form method="post">
                <input
                  readOnly
                  name="tag_id"
                  value={t.id}
                  className="hidden"
                ></input>
                <input
                  name="workout_id"
                  value={data.workout.id}
                  readOnly
                  className="hidden"
                ></input>

                <input
                  name={"_action"}
                  value={"associate_tag"}
                  className="hidden"
                  readOnly
                />
                <button>{t.label}</button>
              </associateTagFetcher.Form>
            </li>
          ))}
        </ul>
      </div>
      <Form
        onChange={handleChange}
        method="get"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          color: "black",
        }}
      >
        <label
          htmlFor="default-search"
          className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            defaultValue={data.exerciseQuery ?? ""}
            name={"exerciseQuery"}
            className="block h-[30px] w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Filter exercise..."
          />
        </div>
      </Form>
      <div className="inline">
        <Carrousel
          workoutId={data.workout.id}
          elementList={data.exerciseList}
          createExerciseFetcher={createExerciseFetcher}
          Card={Card}
        />
      </div>
      <div
        className={`flex h-[calc(100vh-225px)] flex-col gap-1 overflow-auto`}
      >
        {transitions((style, s, _, i) => {
          return (
            <a.details
              style={style}
              open={i === data.workout.set.length - 1}
              key={s.id}
            >
              <summary className="daily__summary flex h-[40px] cursor-pointer items-center justify-between bg-gray-700">
                <h3 className="px-5 font-bold">
                  {i}. {s.exercise.title}
                </h3>
                <div className="flex">
                  <button
                    onClick={() => open(s)}
                    className="flex h-[40px] w-[50px] items-center justify-center bg-blue-500 text-blue-100 transition-colors duration-150 hover:bg-blue-600"
                  >
                    <GiNotebook />
                  </button>
                  <deleteSetFetcher.Form method="post">
                    <input type="hidden" value={s.id} name="setId" />{" "}
                    <button
                      className="focus:shadow-outline flex h-full h-[40px] w-[50px] items-center justify-center bg-red-700 text-lg font-bold text-red-100 transition-colors duration-150 hover:bg-red-800"
                      type="submit"
                      name="_action"
                      value="delete_set"
                    >
                      <AiFillDelete />
                    </button>
                  </deleteSetFetcher.Form>
                </div>
              </summary>

              <createSeriesFetcher.Form
                className="hidden"
                method="post"
                id={s.id}
              />
              <div className="flex flex-col gap-2">
                <TableHead />
                <TableBody
                  optimistSeries={s.series}
                  disabled={transition.submission != null}
                  set={s}
                  deleteSeriesFetcher={deleteSeriesFetcher}
                />
              </div>
              <div className={"flex items-center justify-center"}>
                <Link
                  className={"flex items-center justify-center p-3 font-bold"}
                  to={`/exercise/${s.exerciseId}`}
                >
                  Exercice <GoLinkExternal className="ml-2" />
                </Link>
              </div>
            </a.details>
          );
        })}
        <div className="flex justify-center font-bold">
          Total volume: {volumeTotal}kg
          <br />
          {data.lastSeanceWithTheSameTag && `Total volume previous workout
          (${dayjs(data.lastSeanceWithTheSameTag.date).format(
            "YYYY/MM/DD"
          )}): ${volumeTotalLastSeance}kg`}
        </div>
      </div>
      <SeriesNote open={showDialog.open} close={close} set={showDialog.set} />
    </div>
  );
}

function computeTotalVolume(data: LoaderData["workout"]) {
  let volumeTotal = 0;
  for (const set of data.set) {
    for (const ser of set.series) {
      volumeTotal += ser.repetitions * ser.weigth;
    }
  }
  return volumeTotal;
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
