import React, {useRef} from "react";
import {AxisOptions, Chart} from "react-charts";
import dayjs from "dayjs";

export type GraphData = {
    label: string,
    data: {
        date: Date,
        secondary: number
    }[]
}[]

export default function Line({data}: { data: GraphData }) {

    const hackyRef = useRef<HTMLButtonElement>(null);
    const primaryAxis = React.useMemo<AxisOptions<typeof data[number]["data"][number]>>(
        () => ({
            getValue: (datum) => dayjs(datum.date).toDate() as unknown as Date,
            elementType: "line"
        }),
        []
    );

    const secondaryAxes = React.useMemo<AxisOptions<typeof data[number]["data"][number]>[]>(
        () => [
            {
                getValue: (datum) => datum.secondary,
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
                    dark: true,
                }}
            />
        </>
    );
}
