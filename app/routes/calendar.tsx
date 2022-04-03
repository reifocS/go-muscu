import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";


function App() {
  /*
  const start = useStore(selectorStart)
  const nextMonth = useStore(selectorPrev)
  const prevMonth = useStore(selectorPrev)
  const dayInMonth = start.daysInMonth();
  const weekInMonth = Math.floor(dayInMonth / 7);
*/
  const [startDate, setStartDate] = useState(() => dayjs().startOf("month"))

  return (
    <>
      <TableMonth startDate={startDate} />
      <br />
      <h3>{startDate.format("MMMM")}</h3>
      <button onClick={() => setStartDate(prev => prev.subtract(1, "month"))}>{"<"}</button>
      <button onClick={() => setStartDate(prev => prev.add(1, "month"))}>{">"}</button>
    </>
  );
}

const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TableHead = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {daysInWeek.map(d => <th key={d} className="px-6 py-2 text-md text-gray-500">{d}</th>
        )}
      </tr>
    </thead>
  )
}

const weekArray: Array<number> = Array(7).fill(0);

const Cell = ({ day, isPast }: { day?: Dayjs, isPast: boolean }) => {

  return (
    <td
      className={`px-6 py-4 ${isPast && "text-gray-500"}`}
    >{day?.format("DD") ?? ""}</td>
  )
}

const Week = ({ weekNumber, daysInMonth, startDate }: { weekNumber: number, daysInMonth: Array<Dayjs>, startDate: Dayjs }) => {
  return <tr className="whitespace-nowrap">
    {
      weekArray.map((_, index) => {
        const day = weekNumber * 7 + (index + 1);
        const isPast = daysInMonth[day]?.isBefore(startDate);
        return (
          <Cell day={daysInMonth[day]} key={index} isPast={isPast} />
        )
      })}
  </tr>
}

const getAllDaysInMonth = (startDate: dayjs.Dayjs, daysInMonth: number): Array<Dayjs> => {
  let days = []
  const firstDayIndex = startDate.day();
  for (let i = firstDayIndex + 1; i > 0; --i) {
    days.push(startDate.subtract(i, "day"));
  }
  for (let i = 0; i < daysInMonth; ++i) {
    days.push(startDate.add(i, "day"));
  }
  return days;
}

const weeks = Array(6).fill(0);

const TableMonth = ({ startDate }: { startDate: dayjs.Dayjs }) => {
  const dayInMonth = startDate.daysInMonth();
  const allDaysInMonth = getAllDaysInMonth(startDate, dayInMonth);
  return (<table
    className="w-full table-auto divide-y divide-gray-300 ">

    <TableHead />
    <tbody className="bg-white divide-y divide-gray-300 text-center">
      {weeks.map((_, i) => {
        return (
          <Week key={i} weekNumber={i} startDate={startDate} daysInMonth={allDaysInMonth} />
        )
      })}
    </tbody>
  </table>
  )
}

export default App;
