import dayjs, {Dayjs} from "dayjs";
import {useState} from "react";
import {getColors} from "~/utils";
import type {LoaderFunction} from "remix";
import {ActionFunction, Form, json, Link, NavLink, redirect, useLoaderData,} from "remix";
import {ArrowContainer, Popover} from 'react-tiny-popover'

import {requireUserId} from "~/session.server";
import {createWorkout, getWorkoutList, Workout,} from "~/models/workout.server";
import {getExerciseTitleOrdered} from "~/models/exercise.server";

type WorkoutWithExercise = Workout & {
    set: {
        exercise: {
            title: string;
        };
    }[];
};

type LoaderData = {
    dateMap: Record<string, WorkoutWithExercise>;
    exerciseList: Array<{ title: string; id: string }>;
};

type ActionData = {
    errors?: {
        date?: string;
    };
};

export const action: ActionFunction = async ({request}) => {
    const userId = await requireUserId(request);

    const formData = await request.formData();
    const date = formData.get("date");

    if (typeof date !== "string") {
        return json<ActionData>(
            {errors: {date: "Date is required"}},
            {status: 400}
        );
    }

    const workout = await createWorkout({date: new Date(date), userId});

    return redirect(`../daily?workoutId=${workout.id}`);
};

const DATE_FORMAT = "MM/DD/YYYY";

const getKey = (date: Date) => dayjs(date).format(DATE_FORMAT);

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const workoutList = await getWorkoutList({userId});
    const exerciseList = await getExerciseTitleOrdered({userId});
    const dateMap: Record<string, WorkoutWithExercise> = {};
    for (const w of workoutList) {
        dateMap[getKey(w.date)] = w;
    }
    return json<LoaderData>({dateMap, exerciseList});
};

export default function Calendar() {
    const data = useLoaderData() as LoaderData;
    const colors = getColors(data.exerciseList.length);
    const [startDate, setStartDate] = useState(() => dayjs().startOf("month"));

    return (
        <div className="flex w-full flex-col items-center">
            <TableMonth
                startDate={startDate}
                dateMap={data.dateMap}
                exerciseList={data.exerciseList}
                colors={colors}
            />
            <Legend exercises={data.exerciseList} colors={colors}/>
            <div className="flex items-center">
                <button
                    className="px-2 py-2"
                    onClick={() => setStartDate((prev) => prev.subtract(1, "month"))}
                >
                    {"<"}
                </button>
                <h3>{startDate.format("MMMM")}</h3>
                <button
                    className="px-2 py-2"
                    onClick={() => setStartDate((prev) => prev.add(1, "month"))}
                >
                    {">"}
                </button>
            </div>
        </div>
    );
}

const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TableHead = () => {
    return (
        <thead>
        <tr>
            {daysInWeek.map((d) => (
                <th key={d} className="px-2 py-2 text-xs text-gray-500">
                    {d}
                </th>
            ))}
        </tr>
        </thead>
    );
};

const weekArray: Array<number> = Array(7).fill(0);

const Cell = ({
                  day,
                  isGray,
                  workout,
                  exerciseList,
                  colors,
              }: {
    day?: Dayjs;
    isGray: boolean;
    workout?: WorkoutWithExercise;
    exerciseList: LoaderData["exerciseList"];
    colors: Array<string>;
}) => {
    if (!day) {
        return null;
    }

    return (
        <td
            className={`h-full px-2 py-3 ${isGray && "text-gray-500"} text-xs  ${
                dayjs(day).isSame(dayjs(), "day") && "bg-gray-600"
            }`}
        >
            {workout ? (
                <NavLink to={`../daily?workoutId=${workout.id}`}>
                    <div className="h-full w-full font-bold md:text-lg">
                        {day?.format("DD") ?? ""}
                    </div>
                    <div className="flex justify-center flex-wrap gap-[1px]">
                        {[...new Set([...workout.set.map((e) => e.exercise.title)])].slice(0, 3).map(
                            (s, i) => (
                                <div
                                    key={i}
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            colors[exerciseList.findIndex((e) => e.title === s)],
                                    }}
                                />
                            )
                        )}
                    </div>
                </NavLink>
            ) : (
                <Form method="post">
                    <input name="date" type="hidden" value={day.format("MM/DD/YYYY")}/>
                    <button className="h-full w-full md:text-lg" type="submit">
                        {day?.format("DD") ?? ""}
                    </button>
                </Form>
            )}
        </td>
    );
};

const Week = ({
                  weekNumber,
                  daysInMonth,
                  startDate,
                  endDate,
                  dateMap,
                  exerciseList,
                  colors,
              }: {
    weekNumber: number;
    daysInMonth: Array<Dayjs>;
    startDate: Dayjs;
    endDate: Dayjs;
    dateMap: LoaderData["dateMap"];
    exerciseList: LoaderData["exerciseList"];
    colors: Array<string>;
}) => {
    return (
        <tr className="h-10 md:h-20 lg:h-24">
            {weekArray.map((_, index) => {
                const day = weekNumber * 7 + (index + 1);
                const isGray =
                    daysInMonth[day]?.isBefore(startDate) ||
                    daysInMonth[day]?.isAfter(endDate);
                const workout = dateMap[daysInMonth[day]?.format(DATE_FORMAT)];
                return (
                    <Cell
                        exerciseList={exerciseList}
                        day={daysInMonth[day]}
                        key={index}
                        isGray={isGray}
                        workout={workout}
                        colors={colors}
                    />
                );
            })}
        </tr>
    );
};

const getAllDaysInMonth = (
    startDate: dayjs.Dayjs,
    daysInMonth: number
): Array<Dayjs> => {
    let days = [];
    const firstDayIndex = startDate.day();
    for (let i = firstDayIndex + 1; i > 0; --i) {
        days.push(startDate.subtract(i, "day"));
    }

    for (let i = 0; i < daysInMonth; ++i) {
        days.push(startDate.add(i, "day"));
    }

    const length_days = days.length;
    const next_month = startDate.add(1, "month");
    for (let i = 0; i <= 6 * 7 - length_days; i++) {
        days.push(next_month.add(i, "day"));
    }
    return days;
};

const weeks = Array(6).fill(0);

const TableMonth = ({
                        startDate,
                        dateMap,
                        exerciseList,
                        colors,
                    }: {
    startDate: dayjs.Dayjs;
    dateMap: LoaderData["dateMap"];
    exerciseList: LoaderData["exerciseList"];
    colors: Array<string>;
}) => {
    const dayInMonth = startDate.daysInMonth();
    const allDaysInMonth = getAllDaysInMonth(startDate, dayInMonth);
    const endDate = startDate.add(1, "month").subtract(1, "day");
    return (
        <table className="mt-2 w-full table-fixed divide-y divide-gray-300">
            <TableHead/>
            <tbody className="divide-y divide-gray-300 text-center">
            {weeks.map((_, i) => {
                return (
                    <Week
                        key={i}
                        weekNumber={i}
                        startDate={startDate}
                        endDate={endDate}
                        daysInMonth={allDaysInMonth}
                        exerciseList={exerciseList}
                        dateMap={dateMap}
                        colors={colors}
                    />
                );
            })}
            </tbody>
        </table>
    );
};

function Legend({exercises, colors}: { exercises: LoaderData["exerciseList"], colors: string[] }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return <Popover
        isOpen={isPopoverOpen}
        positions={['top', 'right', 'left', 'bottom']}
        padding={10}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={({position, childRect, popoverRect}) => (
            <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
                position={position}
                childRect={childRect}
                popoverRect={popoverRect}
                arrowColor={'white'}
                arrowSize={10}
                className='popover-arrow-container'
                arrowClassName='popover-arrow'
            >
                <div
                    className="bg-white text-black flex flex-col"
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                >
                    {exercises.map((e, index) => (
                        <div key={e.title} className="px-2">
                            <Link className="flex items-center justify-between underline" to={`../exercise/${e.id}`}>
                                <div>{e.title}</div>
                                <div
                                    className="ml-1.5 h-3.5 w-3.5 rounded-full"
                                    style={{backgroundColor: colors[index]}}
                                ></div>
                            </Link>
                        </div>
                    ))}
                </div>
            </ArrowContainer>
        )}
    >
        <button className="font-bold text-lg" onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
            Légende
        </button>
    </Popover>
}