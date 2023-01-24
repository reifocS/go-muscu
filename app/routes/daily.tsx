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
import {createWorkout, getDailyWorkout, getWorkout, Workout,} from "~/models/workout.server";
import {requireUserId} from "~/session.server";
import {addNote, createSet, deleteSet, Set} from "~/models/set.server";
import {createSeries, deleteSeries, Series} from "~/models/series.server";
import {getExerciseList, getExerciseListContains} from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";
import {Fetcher} from "@remix-run/react/transition";
import {AiFillDelete, AiOutlinePlus} from "react-icons/ai";
import {GiNotebook} from "react-icons/gi"
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {Dialog as ReachDialog} from "@reach/dialog";
import {toast} from "react-toastify";
import {GoLinkExternal} from "react-icons/go";
import {a, useTransition as useSpringTransition} from "@react-spring/web";

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
    exerciseQuery: string | null
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
    let exerciseQuery = url.searchParams.get("exerciseQuery");
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

    let exerciseList;
    if (exerciseQuery) {
        exerciseList = await getExerciseListContains({userId, title: exerciseQuery});
    } else {
        exerciseList = await getExerciseList({userId});
    }

    return json<LoaderData>({
        workout,
        exerciseList,
        isPastWorkout: !!workoutId && !todayMidnight.isSame(workout.date, "day"),
        exerciseQuery
    });
};

export const action: ActionFunction = async ({request}) => {
    await requireUserId(request);
    const formData = await request.formData();
    const {_action} = Object.fromEntries(formData);

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
        <>
            <div style={{gridArea: '1 / 1 / 2 / 2'}}>{series.repetitions}</div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}}>{series.weigth}</div>
            <div
                style={{gridArea: '1 / 3 / 2 / 4'}}
                className="bg-red-700 text-red-100 transition-colors duration-150 hover:bg-red-800">
                <deleteSeriesFetcher.Form method="post" className="h-full flex items-center justify-center">
                    <input
                        type="text"
                        className="hidden"
                        name="id"
                        value={series.id}
                        readOnly
                    />

                    <button
                        className="flex w-full h-full items-center justify-center text-lg font-bold"
                        type="submit"
                        name="_action"
                        value="delete_series"
                    >
                        <AiFillDelete/>
                    </button>
                </deleteSeriesFetcher.Form>
            </div>
        </>
    );
};

function AddSeries({set, disabled}: { set: WorkoutSet; disabled: boolean }) {
    const lastSeries = set.series[set.series.length - 1];

    return (
        <div className="px-2" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr) 0.3fr',
            gridTemplateRows: '1fr',
            gridColumnGap: '16px',
            gridRowGap: '16px',
            height: 30
        }}>
            <div style={{gridArea: '1 / 1 / 2 / 2'}}>
                <input type="hidden" name="setId" value={set.id} form={set.id}/>
                <input
                    name="repetitions"
                    placeholder="rep"
                    type="number"
                    form={set.id}
                    defaultValue={lastSeries?.repetitions}
                    className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    min={0}
                />
            </div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}}>
                <input
                    name="weigth"
                    placeholder="poids"
                    type="number"
                    step="0.01"
                    defaultValue={lastSeries?.weigth}
                    className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    form={set.id}
                    min={0}
                />
            </div>
            <div
                style={{gridArea: '1 / 3 / 2 / 4'}}
                className="bg-blue-500 text-blue-100 transition-colors duration-150 hover:bg-blue-600">
                <button
                    type="submit"
                    name="_action"
                    form={set.id}
                    disabled={disabled}
                    value="add_series"
                    className="flex w-full h-full items-center justify-center text-lg font-bold"
                >
                    <AiOutlinePlus/>
                </button>
            </div>
        </div>
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
    const transitions = useSpringTransition(data.workout.set, {
        keys: (s: WorkoutSet) => s.id,
        from: {opacity: 0.5},
        enter: {opacity: 1},
    });
    const submit = useSubmit();

    const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
        submit(e.currentTarget, {method: "get", replace: true});
    }
    let volumeTotal = 0;
    for (const set of data.workout?.set) {
        for (const ser of set.series) {
            volumeTotal += ser.repetitions * ser.weigth;
        }
    }
    return (
        <div className="w-full overflow-hidden">

            {data.isPastWorkout && (
                <div className="mt-2 text-center font-bold">
                    <h2>Séance du {dayjs(data.workout.date).format("YYYY/MM/DD")}</h2>
                </div>
            )}
            <Form
                onChange={handleChange}
                method="get"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                    color: "black"
                }}
            >
                <label htmlFor="default-search"
                       className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search</label>
                <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                    <input type="search" id="default-search" defaultValue={data.exerciseQuery ?? ""}
                           name={"exerciseQuery"}
                           className="block h-[30px] p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Filter exercise..."/>
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
            <div className={`h-[calc(100vh-225px)] overflow-auto gap-1 flex flex-col`}>
                {transitions((style, s, _, i) => {
                    return (
                        <a.details style={style} open={i === data.workout.set.length - 1} key={s.id}>
                            <summary
                                className="daily__summary flex h-[40px] cursor-pointer items-center justify-between bg-gray-700">
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
                            <div className="flex flex-col gap-2">
                                <TableHead/>
                                <TableBody
                                    optimistSeries={s.series}
                                    disabled={transition.submission != null}
                                    set={s}
                                    deleteSeriesFetcher={deleteSeriesFetcher}
                                />
                            </div>
                            <div className={"flex items-center justify-center"}>
                                <Link
                                    className={
                                        "p-3 flex items-center justify-center font-bold"
                                    }
                                    to={`/exercise/${s.exerciseId}`}
                                >
                                    Exercice{" "}<GoLinkExternal className="ml-2"/>
                                </Link>
                            </div>
                        </a.details>
                    );
                })}
            </div>
            <SeriesNote open={showDialog.open} close={close} set={showDialog.set}/>
            <div className="flex justify-center">Total volume: {volumeTotal}kg</div>
        </div>
    );
}

const TableHead = () => {
    return (
        <div className="px-2" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr) 0.3fr',
            gridTemplateRows: '1fr',
            gridColumnGap: '16px',
            gridRowGap: '16px'
        }}>
            <div style={{gridArea: '1 / 1 / 2 / 2'}} className="px-2 py-2 text-xs text-gray-500">Repetitions</div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}} className="px-2 py-2 text-xs text-gray-500">Poids</div>
            <div style={{gridArea: '1 / 3 / 2 / 4'}} className="px-2 py-2 text-xs text-gray-500">Action</div>
        </div>
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
    const transitions = useSpringTransition(optimistSeries, {
        keys: (s: Series) => s.id,
        from: {opacity: 0, height: 0},
        enter: {opacity: 1, height: 30},
        leave: {opacity: 0, height: 0},
        config: {mass: 1, tension: 500, friction: 0, clamp: true}
    });

    return (
        <>
            {transitions((style, s) => (
                <a.div className="px-2" style={{
                    ...style,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr) 0.3fr',
                    gridTemplateRows: '1fr',
                    gridColumnGap: '16px',
                    gridRowGap: '16px',
                }}>
                    <TableRow
                        series={s}
                        key={s.id}
                        deleteSeriesFetcher={deleteSeriesFetcher}
                    />
                </a.div>
            ))}
            <AddSeries set={set} disabled={disabled}/>
        </>
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
                className="focus:shadow-outline m-1 py-2 h-[85px] w-[85px] rounded-lg bg-gray-700 text-ellipsis
                font-bold break-words overflow-hidden wordtext-white transition-colors duration-150 hover:bg-gray-800"
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

    return <ReachDialog
        aria-label="edit_note"
        style={{
            maxWidth: '450px',
            borderRadius: '3px',
            paddingBottom: '3.5em',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
            margin: '10vh auto',
            width: "100%",
            backgroundColor: "#374151"
        }}
        isOpen={open} onDismiss={close}>
        <div className="flex">
            <button className="ml-auto font-bold bg-red-500 px-3 py-1 rounded" onClick={close}>x</button>
        </div>
        <label htmlFor="note" className="font-bold mb-2">Ajouter une note 📝</label>
        <fetcher.Form method={"post"}>
            <input
                type="text"
                className="hidden"
                name="setId"
                value={set?.id}
                readOnly
            />
            <textarea
                required
                name="note"
                id="note"
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
                defaultValue={set?.note ?? ""}/>
            <input name={"_action"} value={"add_note"} className="hidden" readOnly/>
            <button
                className="flex h-[50px] w-full bg-blue-500 items-center justify-center font-bold text-white"
                type="submit"
            >{set?.note ? "éditer" : "ajouter"}
            </button>
        </fetcher.Form>
    </ReachDialog>
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
