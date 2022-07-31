import * as React from "react";
import dayjs from "dayjs";
import {Form, json, LoaderFunction, useLoaderData} from "remix";
import {requireUserId} from "~/session.server";
import {getAllInRange} from "~/models/workout.server";

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    let startMonthFromParams = url.searchParams.get("month");
    let startMonth;
    if (!startMonthFromParams) {
        startMonth = dayjs().startOf("month");
    } else {
        startMonth = dayjs(startMonthFromParams).startOf("month");
    }
    const endOfMonth = startMonth.endOf("month");
    const allInMonth = await getAllInRange({
        dateStart: startMonth.toDate(),
        dateEnd: endOfMonth.toDate(),
        userId
    })
    const exerciseWithAmount: Record<string, number> = {};
    for (const w of allInMonth) {
        for (const s of w.set) {
            if (exerciseWithAmount[s.exercise.title] !== undefined) {
                exerciseWithAmount[s.exercise.title] = exerciseWithAmount[s.exercise.title] + s.series.length;
            } else {
                exerciseWithAmount[s.exercise.title] = 0;
            }
        }
    }
    return json({
        allInMonth,
        month: startMonth.format("YYYY-MM"),
        nbOfWorkouts: allInMonth.length,
        exerciseWithAmount
    });
};

export default function Rapport() {
    const data = useLoaderData();
    return (
        <>
            <Form
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
                    you trained {data.nbOfWorkouts} times in {dayjs(data.month).format("MMMM")}
                </p>
                <label htmlFor="start">Start month:</label>
                <input type="month" id="month" name="month"
                       className="text-black"
                       required
                       defaultValue={data.month}/>
                <button
                    type="submit"
                    className="my-2 inline-flex items-center justify-center bg-blue-500 p-2 font-bold text-blue-100 transition-colors duration-150 hover:bg-blue-600"
                >
                    Generate report
                </button>

                    <ul>
                        {Object.entries(data.exerciseWithAmount).map(([k, v]) => <li key={k}>
                            {k}: {v} series
                        </li>)}
                    </ul>
            </Form>
        </>
    )
}