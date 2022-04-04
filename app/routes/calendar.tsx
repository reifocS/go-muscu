import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import {
  json,
  useLoaderData,
  NavLink,
  Outlet,
  ActionFunction,
  Form,
  redirect,
} from "remix";
import type { LoaderFunction } from "remix";

import { requireUserId } from "~/session.server";
import { createWorkout, getWorkoutList } from "~/models/workout.server";

type LoaderData = {
  dateMap: Record<string, string>;
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
  const dateMap: Record<string, string> = {};
  for (const w of workoutList) {
    dateMap[w.date.getTime()] = w.id;
  }
  return json<LoaderData>({ dateMap });
};

export default function Calendar() {
  const data = useLoaderData() as LoaderData;
  const [startDate, setStartDate] = useState(() => dayjs().startOf("month"));

  return (
    <div className="flex w-full flex-col items-center">
      <TableMonth startDate={startDate} dateMap={data.dateMap} />
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
  workoutId,
}: {
  day?: Dayjs;
  isPast: boolean;
  workoutId?: string;
}) => {
  if (!day) {
    return <td className={`px-2 py-2 opacity-0`}>X</td>;
  }

  return (
    <td className={`px-2 py-2 ${isPast && "text-gray-500"} text-xs`}>
      {workoutId ? (
        <NavLink to={workoutId}>
          <span className="text-red-700">{day?.format("DD") ?? ""}</span>
        </NavLink>
      ) : (
        <Form method="post">
          <input
            name="date"
            type="hidden"
            value={day.format("MM/DD/YYYY")}
          ></input>
          <button type="submit">{day?.format("DD") ?? ""}</button>
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
}: {
  weekNumber: number;
  daysInMonth: Array<Dayjs>;
  startDate: Dayjs;
  dateMap: LoaderData["dateMap"];
}) => {
  return (
    <tr className="">
      {weekArray.map((_, index) => {
        const day = weekNumber * 7 + (index + 1);
        const isPast = daysInMonth[day]?.isBefore(startDate);
        const workoutId = dateMap[daysInMonth[day]?.toDate().getTime()];
        return (
          <Cell
            day={daysInMonth[day]}
            key={index}
            isPast={isPast}
            workoutId={workoutId}
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
}: {
  startDate: dayjs.Dayjs;
  dateMap: LoaderData["dateMap"];
}) => {
  const dayInMonth = startDate.daysInMonth();
  const allDaysInMonth = getAllDaysInMonth(startDate, dayInMonth);
  return (
    <table className="mt-2 table-fixed divide-y divide-gray-300 border">
      <TableHead />
      <tbody className="divide-y divide-gray-300 bg-white text-center">
        {weeks.map((_, i) => {
          return (
            <Week
              key={i}
              weekNumber={i}
              startDate={startDate}
              daysInMonth={allDaysInMonth}
              dateMap={dateMap}
            />
          );
        })}
      </tbody>
    </table>
  );
};
