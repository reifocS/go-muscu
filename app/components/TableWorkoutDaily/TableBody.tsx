import {Series} from "~/models/series.server";
import {Fetcher} from "@remix-run/react/transition";
import {a, useTransition as useSpringTransition} from "@react-spring/web";
import * as React from "react";
import AddSeries from "~/components/TableWorkoutDaily/AddSeries";
import {WorkoutSet} from "~/routes/daily";
import TableRow from "~/components/TableWorkoutDaily/TableRow";

const TableBody = ({
                       optimistSeries,
                       disabled,
                       set,
                       deleteSeriesFetcher,
                   }: {
    optimistSeries: Series[];
    disabled: boolean;
    set: WorkoutSet;
    deleteSeriesFetcher: Fetcher;
}) => {
    const transitions = useSpringTransition(optimistSeries, {
        keys: (s: Series) => s.id,
        from: {opacity: 0, height: 0},
        enter: {opacity: 1, height: 30},
        leave: {opacity: 0, height: 0},
        config: {mass: 1, tension: 500, friction: 0, clamp: true}
    });

    return (
        <>
            {transitions((style, s) => (
                <a.div className="px-2" style={{
                    ...style,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr) 0.3fr',
                    gridTemplateRows: '1fr',
                    gridColumnGap: '16px',
                    gridRowGap: '16px',
                }}>
                    <TableRow
                        series={s}
                        key={s.id}
                        deleteSeriesFetcher={deleteSeriesFetcher}
                    />
                </a.div>
            ))}
            <AddSeries set={set} disabled={disabled}/>
        </>
    );
};

export default TableBody