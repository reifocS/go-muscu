import dayjs from "dayjs";
import {ActionFunction, json, Link, LoaderFunction, useCatch, useFetcher, useLoaderData, useTransition,} from "remix";
import {createWorkout, getDailyWorkout, getWorkout, Workout,} from "~/models/workout.server";
import {requireUserId} from "~/session.server";
import {addNote, createSet, deleteSet, Set} from "~/models/set.server";
import {createSeries, deleteSeries, Series} from "~/models/series.server";
import {getExerciseList} from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";
import {Fetcher} from "@remix-run/react/transition";
import {AiFillDelete, AiOutlinePlus} from "react-icons/ai";
import {GiNotebook} from "react-icons/gi"
import {useCallback, useEffect, useState} from "react";
import {Dialog} from "@reach/dialog";
import {toast} from "react-toastify";

type WorkoutSet = Set & {
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

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    const workoutId = url.searchParams.get("workoutId");
    const todayMidnight = dayjs().startOf("day");
    const tomorrowMidnight = dayjs(todayMidnight.add(1));

    let workout;
    if (workoutId) {
        workout = await getWorkout({userId, id: workoutId});
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

    const exerciseList = await getExerciseList({userId});

    return json<LoaderData>({
        workout,
        exerciseList,
        isPastWorkout: !!workoutId && !todayMidnight.isSame(workout.date, "day"),
    });
};

export const action: ActionFunction = async ({request}) => {
    await requireUserId(request);
    const formData = await request.formData();
    const {_action} = Object.fromEntries(formData);
    console.log(_action)

    if (_action === "delete_set") {
        const setId = formData.get("setId");

        if (typeof setId !== "string") {
            return json<ActionData>(
                {errors: {exerciseId: "setId is required"}},
                {status: 400}
            );
        }
        return deleteSet({id: setId});
    }
    if (_action === "delete_series") {
        const id = formData.get("id");

        if (typeof id !== "string") {
            return json<ActionData>(
                {errors: {id: "id is required"}},
                {status: 400}
            );
        }
        return deleteSeries({id});
    }
    if (_action === "add_series") {
        const setId = formData.get("setId");
        const repetitions = formData.get("repetitions");
        const weigth = formData.get("weigth");
        if (typeof setId !== "string") {
            return json<ActionData>(
                {errors: {exerciseId: "setId is required"}},
                {status: 400}
            );
        }
        if (typeof repetitions !== "string") {
            return json<ActionData>(
                {errors: {exerciseId: "rep is required"}},
                {status: 400}
            );
        }
        if (typeof weigth !== "string") {
            return json<ActionData>(
                {errors: {exerciseId: "weigth is required"}},
                {status: 400}
            );
        }
        return createSeries({setId, repetitions: +repetitions, weigth: +weigth});
    }
    if (_action === "add_exercise") {
        const exerciseId = formData.get("exerciseId");
        if (typeof exerciseId !== "string") {
            return json<ActionData>(
                {errors: {exerciseId: "exerciseId is required"}},
                {status: 400}
            );
        }
        const workoutId = formData.get("workoutId");
        if (!workoutId || typeof workoutId !== "string")
            throw new Error("No workout id");
        return createSet({workoutId, exerciseId});
    }
    if (_action === "add_note") {
        const setId = formData.get("setId");
        if (typeof setId !== "string") {
            return json<ActionData>(
                {errors: {setId: "setId is required"}},
                {status: 400}
            );
        }
        const note = formData.get("note");
        if (!note || typeof note !== "string")
            throw new Error("Note is empty");
        return addNote(setId, note);
    }
};

const TableRow = ({
                      series,
                      deleteSeriesFetcher,
                  }: {
    series: Series;
    deleteSeriesFetcher: any;
}) => {
    return (
        <tr className="h-10">
            <td className="h-full px-2 py-2 text-xs">{series.repetitions}</td>
            <td className="h-full px-2 py-2 text-xs">{series.weigth}</td>
            <td className="bg-red-700 text-red-100 transition-colors duration-150 hover:bg-red-800">
                <deleteSeriesFetcher.Form method="post">
                    <input
                        type="text"
                        className="hidden"
                        name="id"
                        value={series.id}
                        readOnly
                    />

                    <button
                        className="flex h-[50px] w-full items-center justify-center font-bold"
                        type="submit"
                        name="_action"
                        value="delete_series"
                    >
                        <AiFillDelete/>
                    </button>
                </deleteSeriesFetcher.Form>
            </td>
        </tr>
    );
};

function AddSeries({set, disabled}: { set: Set; disabled: boolean }) {
    return (
        <tr className="h-10">
            <td className="h-full px-2 py-2 text-xs">
                <input type="hidden" name="setId" value={set.id} form={set.id}/>
                <input
                    name="repetitions"
                    placeholder="rep"
                    type="number"
                    form={set.id}
                    className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    min={0}
                />
            </td>
            <td className="h-full px-2 py-2 text-xs">
                <input
                    name="weigth"
                    placeholder="poids"
                    type="number"
                    step="0.01"
                    className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    form={set.id}
                    min={0}
                />
            </td>
            <td className="bg-blue-500 text-blue-100 transition-colors duration-150 hover:bg-blue-600">
                <button
                    type="submit"
                    name="_action"
                    form={set.id}
                    disabled={disabled}
                    value="add_series"
                    className="flex w-full items-center justify-center text-lg font-bold"
                >
                    <AiOutlinePlus/>
                </button>
            </td>
        </tr>
    );
}

export default function WorkoutDetailsPage() {
    const data = useLoaderData() as LoaderData;
    const transition = useTransition();
    const deleteSetFetcher = useFetcher();
    const deleteSeriesFetcher = useFetcher();
    const createSeriesFetcher = useFetcher();
    const createExerciseFetcher = useFetcher();
    const [showDialog, setShowDialog] = useState<{ open: boolean, set?: Set }>({open: false, set: undefined});
    const open = (s: Set) => setShowDialog({open: true, set: s});
    const close = useCallback(() => setShowDialog({open: false, set: undefined}), []);

    return (
        <div className="h-full w-full overflow-hidden">
            {data.isPastWorkout && (
                <div className="mt-2 text-center font-bold">
                    <h2>Séance du {dayjs(data.workout.date).format("YYYY/MM/DD")}</h2>
                </div>
            )}

            <div className="p-2">
                <Carrousel
                    workoutId={data.workout.id}
                    elementList={data.exerciseList}
                    createExerciseFetcher={createExerciseFetcher}
                    Card={Card}
                />
            </div>
            <div className={`h-[calc(100vh-225px)] overflow-auto`}>
                {data.workout.set.map((s, i) => {
                    return (
                        <details open={i === data.workout.set.length - 1} key={s.id}>
                            <summary
                                className="flex h-[40px] cursor-pointer items-center justify-between border-t bg-gray-700">
                                <h3 className="px-5 font-bold">
                                    {i}. {s.exercise.title}
                                </h3>
                                <div className="flex">
                                    <button
                                        onClick={() => open(s)}
                                        className="h-[40px] w-[50px] bg-blue-500 text-blue-100 transition-colors duration-150 hover:bg-blue-600 flex items-center justify-center">
                                        <GiNotebook/>
                                    </button>
                                    <deleteSetFetcher.Form method="post">
                                        <input type="hidden" value={s.id} name="setId"/>{" "}
                                        <button
                                            className="focus:shadow-outline flex h-full h-[40px] w-[50px] items-center justify-center bg-red-700 text-lg font-bold text-red-100 transition-colors duration-150 hover:bg-red-800"
                                            type="submit"
                                            name="_action"
                                            value="delete_set"
                                        >
                                            <AiFillDelete/>
                                        </button>
                                    </deleteSetFetcher.Form>
                                </div>
                            </summary>

                            <createSeriesFetcher.Form
                                className="hidden"
                                method="post"
                                id={s.id}
                            />
                            <div className="flex items-center justify-center">
                                <table className="w-full table-auto divide-y border-none">
                                    <TableHead/>
                                    <TableBody
                                        optimistSeries={s.series}
                                        disabled={transition.submission != null}
                                        set={s}
                                        deleteSeriesFetcher={deleteSeriesFetcher}
                                    />
                                </table>
                            </div>
                            <div className={"flex items-center justify-center"}>
                                <Link
                                    className={
                                        "p-3 text-blue-600 underline visited:text-purple-600"
                                    }
                                    to={`/exercise/${s.exerciseId}`}
                                >
                                    Go to exercise
                                </Link>
                            </div>
                        </details>
                    );
                })}
            </div>
            <SeriesNote open={showDialog.open} close={close} set={showDialog.set}/>
        </div>
    );
}

const TableHead = () => {
    return (
        <thead className="bg-gray-800">
        <tr>
            <th className="px-2 py-2 text-xs text-gray-500">Repetitions</th>
            <th className="px-2 py-2 text-xs text-gray-500">Poids</th>
            <th className="px-2 py-2 text-xs text-gray-500">Action</th>
        </tr>
        </thead>
    );
};

const TableBody = ({
                       optimistSeries,
                       disabled,
                       set,
                       deleteSeriesFetcher,
                   }: {
    optimistSeries: Series[];
    disabled: boolean;
    set: WorkoutSet;
    deleteSeriesFetcher: Fetcher;
}) => {
    return (
        <tbody className="text-center">
        {optimistSeries.map((series) => (
            <TableRow
                series={series}
                key={series.id}
                deleteSeriesFetcher={deleteSeriesFetcher}
            />
        ))}
        <AddSeries set={set} disabled={disabled}/>
        </tbody>
    );
};

function Card({
                  el,
                  itemId,
                  workoutId,
                  createExerciseFetcher,
              }: {
    el: { title: string; id: string };
    itemId: string;
    workoutId: string;
    createExerciseFetcher: any;
}) {
    return (
        <createExerciseFetcher.Form
            key={itemId}
            method="post"
            tabIndex={0}
            className="flex"
        >
            <input type="hidden" name="exerciseId" value={el.id}/>
            <input type="hidden" name="workoutId" value={workoutId}/>
            <button
                type="submit"
                name="_action"
                className="focus:shadow-outline m-1 h-[85px] w-[85px] rounded-lg bg-gray-700 font-bold
          text-white transition-colors duration-150 hover:bg-gray-800"
                value="add_exercise"
            >
                {el.title}
            </button>
        </createExerciseFetcher.Form>
    );
}

function SeriesNote({open, close, set}: { open: boolean, close: () => void, set?: Set }) {
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === "submitting") {
            close();
            toast.success('Note ajouté 💪', {
                position: "top-right",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        }
    }, [fetcher.state, close])

    return <Dialog
        aria-label="edit_note"
        style={{
            maxWidth: '450px',
            borderRadius: '3px',
            paddingBottom: '3.5em',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
            margin: '10vh auto',
            width: "100%",
            backgroundColor: "#00000080"
        }}
        isOpen={open} onDismiss={close}>
        <div className="flex">
            <button className="ml-auto font-bold" onClick={close}>x</button>
        </div>
        <h1 className="font-bold">Ajouter une note 📝</h1>
        <fetcher.Form method={"post"}>
            <input
                type="text"
                className="hidden"
                name="setId"
                value={set?.id}
                readOnly
            />
            <textarea
                className="w-full px-3
                            py-1.5
                            text-base
                            font-normal
                            text-gray-700
                            bg-white bg-clip-padding
                            border border-solid border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                name="note" defaultValue={set?.note ?? ""}/>
            <input name={"_action"} value={"add_note"} className="hidden" readOnly/>
            <button
                className="flex h-[50px] w-full bg-blue-500 items-center justify-center font-bold text-white"
                type="submit"
            >{set?.note ? "éditer" : "ajouter"}
            </button>
        </fetcher.Form>
    </Dialog>
}

export function ErrorBoundary({error}: { error: Error }) {
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
