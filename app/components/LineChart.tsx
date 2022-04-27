import React from "react";
import {AxisOptions, Chart} from "react-charts";
import dayjs from "dayjs";

export type GraphData = {
    label: string,
    data: {
        date: dayjs.Dayjs,
        volume: number
    }[]
}[]

export default function Line({data}: { data: GraphData }) {
    const primaryAxis = React.useMemo<AxisOptions<typeof data[number]["data"][number]>>(
        () => ({
            getValue: (datum) => dayjs(datum.date).format("MM/DD") as unknown as string,
            elementType: "line"
        }),
        []
    );

    const secondaryAxes = React.useMemo<AxisOptions<typeof data[number]["data"][number]>[]>(
        () => [
            {
                getValue: (datum) => datum.volume,
                elementType: "line"
            },
        ],
        []
    );

    return (
        <>
            <Chart
                options={{
                    data,
                    primaryAxis,
                    secondaryAxes,
                    dark: true
                }}
            />
        </>
    );
}
