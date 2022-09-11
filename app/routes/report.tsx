import * as React from "react";
import {useRef} from "react";
import dayjs from "dayjs";
import {Form, json, LoaderFunction, useLoaderData, useSubmit} from "remix";
import {requireUserId} from "~/session.server";
import {getAllInRange} from "~/models/workout.server";

dayjs.Ls.en.weekStart = 1;

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    let startDateFromParams = url.searchParams.get("start");
    let endDateFromParams = url.searchParams.get("end");
    let start;
    if (!startDateFromParams) {
        start = dayjs().startOf("month");
    } else {
        start = dayjs(startDateFromParams);
    }
    let end;
    if (!endDateFromParams) {
        end = start.endOf("month");
    } else {
        end = dayjs(endDateFromParams)
    }
    const allInMonth = await getAllInRange({
        dateStart: start.toDate(),
        dateEnd: end.toDate(),
        userId
    })
    const exerciseWithAmount: Record<string, number> = {};
    for (const w of allInMonth) {
        for (const s of w.set) {
            if (exerciseWithAmount[s.exercise.title] !== undefined) {
                exerciseWithAmount[s.exercise.title] = exerciseWithAmount[s.exercise.title] + s.series.length;
            } else {
                exerciseWithAmount[s.exercise.title] = s.series.length;
            }
        }
    }
    return json({
        allInMonth,
        start: start.format("YYYY-MM-DD"),
        end: end.format("YYYY-MM-DD"),
        nbOfWorkouts: allInMonth.filter(w => w.set.length > 0).length,
        exerciseWithAmount
    });
};

export default function Rapport() {
    const data = useLoaderData();
    const submit = useSubmit();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (start: string, end: string) => {
        if (!formRef.current) return;
        const form = formRef.current as (typeof formRef.current & {
            start: { value: string };
            end: { value: string };
        });
        form.start.value = start;
        form.end.value = end;
        submit(form, {method: "get"});
    }

    const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
        const form = e.currentTarget as (typeof formRef.current & {
            start: { value: string };
            end: { value: string };
        });
        if(!form.start.value || !form.end.value) return;
        submit(e.currentTarget, { method: "get", replace: true });
    }

    return (
        <>
            <Form
                ref={formRef}
                onChange={handleChange}
                method="get"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                <p>
                    you trained {data.nbOfWorkouts} times
                    between {dayjs(data.start).format('M/D/YYYY')} and {dayjs(data.end).format('M/D/YYYY')}
                </p>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button type="button"
                            onClick={() => {
                                handleSubmit(
                                    dayjs().startOf("week").subtract(7, 'day').format("YYYY-MM-DD"),
                                    dayjs().endOf("week").subtract(7, 'day').format("YYYY-MM-DD"))
                            }}
                            className="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        Last week
                    </button>
                    <button type="button"
                            onClick={() => {
                                handleSubmit(dayjs().startOf("week").format("YYYY-MM-DD"), dayjs().endOf("week").format("YYYY-MM-DD"))
                            }}
                            className="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        This week
                    </button>
                    <button type="button"
                            onClick={() => {
                                const start = dayjs().startOf("month").subtract(1, 'month');
                                handleSubmit(start.format("YYYY-MM-DD"),
                                    start.endOf("month").format("YYYY-MM-DD"))
                            }}
                            className="py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        Last month
                    </button>
                    <button type="button"
                            onClick={() => {
                                handleSubmit(dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().endOf("month").format("YYYY-MM-DD"))
                            }}
                            className="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                        This month
                    </button>
                </div>

                <div className="flex gap-2">
                    <label htmlFor="start">From </label>{" "}
                    <input type="date" id="start" name="start"
                           className="text-black"
                           required
                           defaultValue={data.start}/>
                    <label htmlFor="end">To </label>
                    <input type="date" id="end" name="end"
                           className="text-black"
                           required
                           defaultValue={data.end}/>
                </div>

                <ul>
                    {Object.entries(data.exerciseWithAmount).map(([k, v]) => <li key={k}>
                        {k}: {v} series
                    </li>)}
                </ul>
            </Form>
        </>
    )
}