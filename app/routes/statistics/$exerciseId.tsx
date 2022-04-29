import type {LoaderFunction} from "remix";
import {json, useCatch, useLoaderData} from "remix";
import type {Set} from "~/models/set.server";
import invariant from "tiny-invariant";
import {Exercise, getExercise,} from "~/models/exercise.server";
import type {Series} from "~/models/series.server";
import {requireUserId} from "~/session.server";
import Line, {GraphData} from "~/components/LineChart";
import {useState} from "react";

type LoaderData = {
    exercise: Exercise & {
        set: (Set & {
            series: Series[];
            workout: {
                date: Date;
            };
        })[];
    };
    graphData: GraphData
};

export const loader: LoaderFunction = async ({request, params}) => {
    const userId = await requireUserId(request);
    invariant(params.exerciseId, "exerciseId not found");

    const ex = await getExercise({userId, id: params.exerciseId});

    if (!ex) {
        throw new Response("Not Found", {status: 404});
    }
    let averageWeightOverTime = [];
    let totalVolumeOverTime = [];
    let repetitions = [];
    let reversedSet = [...ex.set].reverse();
    for (const set of reversedSet) {
        let totalVolume = 0;
        let totalRep = 0;
        let averageWeight = 0;
        for (const series of set.series) {
            totalVolume += series.weigth * series.repetitions;
            totalRep += series.repetitions;
            averageWeight += series.weigth;
        }
        averageWeight /= set.series.length ?? 1;
        totalVolumeOverTime.push({
            date: set.workout.date,
            secondary: totalVolume
        })
        repetitions.push({
            date: set.workout.date,
            secondary: totalRep
        })
        averageWeightOverTime.push({
            date: set.workout.date,
            secondary: averageWeight
        })
    }
    let graphData: GraphData = [{label: "volume total", data: totalVolumeOverTime},
        {label: "repetitions", data: repetitions},
        {label: "poids moyen", data: averageWeightOverTime}
    ]
    return json<LoaderData>({exercise: ex, graphData});
};

export default function StatisticsDetailsPage() {
    const data = useLoaderData() as LoaderData;
    const [graphToShow, setGraphToShow] = useState(0);

    return (
        <div className="h-[400px]">
            <select
                className="m-3 text-black"
                value={graphToShow} onChange={(event => setGraphToShow(+event.target.value))}>
                {data.graphData.map((d, i) => {
                    return <option value={i} key={i}>{d.label}</option>
                })}
            </select>
            <h1 className="text-center text-2xl font-bold">{data.exercise.title}</h1>
            {data.graphData[0].data.length > 0 ? <Line
                data={[data.graphData[graphToShow]]}/> : <div className="text-center m-3">No data 😱😱😱 </div>}
        </div>
    );
}

export function ErrorBoundary({error}: { error: Error }) {
    console.error(error);

    return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
    const caught = useCatch();

    if (caught.status === 404) {
        return <div>Note not found</div>;
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
