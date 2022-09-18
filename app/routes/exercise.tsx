import type {LoaderFunction} from "remix";
import {Form, json, Link, Outlet, useFetcher, useLoaderData, useSubmit} from "remix";

import {requireUserId} from "~/session.server";
import {getExerciseList, getExerciseListStartWith} from "~/models/exercise.server";
import Carrousel from "~/components/Carrousel";
import * as React from "react";

type LoaderData = {
    exerciseList: Awaited<ReturnType<typeof getExerciseList>>;
    exerciseQuery: string | null;
};

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    let exerciseQuery = url.searchParams.get("exerciseQuery");
    let exerciseList;
    if (exerciseQuery) {
        exerciseList = await getExerciseListStartWith({userId, title: exerciseQuery});
    } else {
        exerciseList = await getExerciseList({userId});
    }
    return json<LoaderData>({exerciseList, exerciseQuery});
};

export default function WorkoutPage() {
    const data = useLoaderData() as LoaderData;
    const createExerciseFetcher = useFetcher();
    const submit = useSubmit();

    const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
        submit(e.currentTarget, {method: "get", replace: true});
    }
    return (
        <div className="h-full min-h-screen">
            <main className="h-[calc(100vh-40px)] overflow-auto">
                <div className="p-2">
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
                    <div className="p-1 inline">
                        <Carrousel
                            elementList={data.exerciseList}
                            createExerciseFetcher={createExerciseFetcher}
                            Card={Card}
                        />
                    </div>
                </div>

                <div className="overflow-auto">
                    <Outlet/>
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
