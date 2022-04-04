import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { colors } from "~/utils";
import {
  json,
  useLoaderData,
  NavLink,
  Outlet,
  ActionFunction,
  Form,
  Link,
  redirect,
} from "remix";
import type { LoaderFunction } from "remix";

import { requireUserId } from "~/session.server";
import {
  createWorkout,
  getWorkoutList,
  Workout,
} from "~/models/workout.server";
import { getExerciseTitleOrdered } from "~/models/exercise.server";

type WorkoutWithExercise = Workout & {
  set: {
    exercise: {
      title: string;
    };
  }[];
};

type LoaderData = {
  dateMap: Record<string, WorkoutWithExercise>;
  exerciseList: Array<{ title: string, id: string }>;
};

type ActionData = {
  errors?: {
    date?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");

  if (typeof date !== "string") {
    return json<ActionData>(
      { errors: { date: "Date is required" } },
      { status: 400 }
    );
  }

  const workout = await createWorkout({ date: new Date(date), userId });

  return redirect(`/calendar/${workout.id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const workoutList = await getWorkoutList({ userId });
  const exerciseList = await getExerciseTitleOrdered({ userId });
  const dateMap: Record<string, WorkoutWithExercise> = {};
  for (const w of workoutList) {
    dateMap[w.date.getTime()] = w;
  }
  return json<LoaderData>({ dateMap, exerciseList });
};

export default function Calendar() {
  const data = useLoaderData() as LoaderData;
  const [startDate, setStartDate] = useState(() => dayjs().startOf("month"));

  return (
    <div className="flex w-full flex-col items-center">
      <TableMonth
        startDate={startDate}
        dateMap={data.dateMap}
        exerciseList={data.exerciseList}
      />

      <div className="flex inline-flex">
        {data.exerciseList.map((e, index) =>
          <div key={e.title} className="px-2">
            <Link className="flex items-center " to={`../exercises/${e.id}`}>
              {e.title}
              <div
                className="rounded-full w-3.5 h-3.5 ml-1.5"
                style={{ backgroundColor: colors[index] }}
              ></div>
            </Link>
          </div>
        )}
      </div>

      <br />
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
      <Outlet />
    </div>
  );
}

const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TableHead = () => {
  return (
    <thead className="bg-gray-50">
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
  isPast,
  workout,
  exerciseList,
}: {
  day?: Dayjs;
  isPast: boolean;
  workout?: WorkoutWithExercise;
  exerciseList: LoaderData["exerciseList"];
}) => {
  if (!day) {
    return <td className={`px-2 py-2 opacity-0`}>X</td>;
  }

  return (
    <td className={`px-2 py-2 h-full ${isPast && "text-gray-500"} text-xs`}>
      {workout ? (
        <NavLink to={workout.id}>
          <span className="font-bold md:text-lg">{day?.format("DD") ?? ""}</span>
          <div className="flex justify-center">
            {workout.set.map((s, i) => (
              <div key={i} className="rounded-full w-2.5 h-2.5 mx-[1px]" style={{
                backgroundColor: colors[
                  exerciseList.findIndex((e) => e.title === s.exercise.title)
                ]
              }}>
              </div>
            ))}
          </div>
        </NavLink>
      ) : (
        <Form method="post">
          <input
            name="date"
            type="hidden"
            value={day.format("MM/DD/YYYY")}
          ></input>
          <button className="md:text-lg" type="submit">{day?.format("DD") ?? ""}</button>
        </Form>
      )}
    </td>
  );
};

const Week = ({
  weekNumber,
  daysInMonth,
  startDate,
  dateMap,
  exerciseList,
}: {
  weekNumber: number;
  daysInMonth: Array<Dayjs>;
  startDate: Dayjs;
  dateMap: LoaderData["dateMap"];
  exerciseList: LoaderData["exerciseList"];
}) => {
  return (
    <tr className="h-10 md:h-20 lg:h-24">
      {weekArray.map((_, index) => {
        const day = weekNumber * 7 + (index + 1);
        const isPast = daysInMonth[day]?.isBefore(startDate);
        const workout = dateMap[daysInMonth[day]?.toDate().getTime()];
        return (
          <Cell
            exerciseList={exerciseList}
            day={daysInMonth[day]}
            key={index}
            isPast={isPast}
            workout={workout}
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
  return days;
};

const weeks = Array(6).fill(0);

const TableMonth = ({
  startDate,
  dateMap,
  exerciseList,
}: {
  startDate: dayjs.Dayjs;
  dateMap: LoaderData["dateMap"];
  exerciseList: LoaderData["exerciseList"];
}) => {
  const dayInMonth = startDate.daysInMonth();
  const allDaysInMonth = getAllDaysInMonth(startDate, dayInMonth);
  return (<table
    className="table-fixed divide-y divide-gray-300 mt-2 border w-full">

    <TableHead />
    <tbody className="bg-white divide-y divide-gray-300 text-center">
      {weeks.map((_, i) => {
        return (
          <Week key={i} weekNumber={i} startDate={startDate} daysInMonth={allDaysInMonth}
            exerciseList={exerciseList}
            dateMap={dateMap}
          />
        )
      })}
    </tbody>
  </table>
  )
}
