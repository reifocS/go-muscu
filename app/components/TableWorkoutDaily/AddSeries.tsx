import {AiOutlinePlus} from "react-icons/ai";
import * as React from "react";
import {WorkoutSet} from "~/routes/daily";

export default function AddSeries({set, disabled}: { set: WorkoutSet; disabled: boolean }) {
    const lastSeries = set.series[set.series.length - 1];

    return (
        <div className="px-2" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr) 0.3fr',
            gridTemplateRows: '1fr',
            gridColumnGap: '16px',
            gridRowGap: '16px',
            height: 30
        }}>
            <div style={{gridArea: '1 / 1 / 2 / 2'}}>
                <input type="hidden" name="setId" value={set.id} form={set.id}/>
                <input
                    name="repetitions"
                    placeholder="rep"
                    type="number"
                    form={set.id}
                    defaultValue={lastSeries?.repetitions}
                    className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    min={0}
                />
            </div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}}>
                <input
                    name="weigth"
                    placeholder="poids"
                    type="number"
                    step="0.01"
                    defaultValue={lastSeries?.weigth}
                    className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    form={set.id}
                    min={0}
                />
            </div>
            <div
                style={{gridArea: '1 / 3 / 2 / 4'}}
                className="bg-blue-500 text-blue-100 transition-colors duration-150 hover:bg-blue-600">
                <button
                    type="submit"
                    name="_action"
                    form={set.id}
                    disabled={disabled}
                    value="add_series"
                    className="flex w-full h-full items-center justify-center text-lg font-bold"
                >
                    <AiOutlinePlus/>
                </button>
            </div>
        </div>
    );
}
