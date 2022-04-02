import dayjs from "dayjs";
import create from "zustand";
import { persist } from "zustand/middleware";

type CalendarState = {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  nextMonth: () => void;
  prevMonth: () => void;
};

export const useStore = create<CalendarState>(
  persist(
    (set) => ({
      startDate: dayjs().startOf("month"),
      endDate: dayjs().endOf("month"),
      nextMonth: () =>
        set((state: CalendarState) => {
          const startDate = state.startDate.add(1, "month");
          const endDate = startDate.endOf("month");
          return {
            startDate,
            endDate,
          };
        }),
      prevMonth: () =>
        set((state: CalendarState) => {
          const startDate = state.startDate.subtract(1, "month");
          const endDate = startDate.endOf("month");
          return {
            startDate,
            endDate,
          };
        }),
    }),
    {
      name: "calendar-storage", // unique name
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);
