import {Series} from "~/models/series.server";
import {AiFillDelete} from "react-icons/ai";
import * as React from "react";

const TableRow = ({
                      series,
                      deleteSeriesFetcher,
                  }: {
    series: Series;
    deleteSeriesFetcher: any;
}) => {
    return (
        <>
            <div style={{gridArea: '1 / 1 / 2 / 2'}}>{series.repetitions}</div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}}>{series.weigth}</div>
            <div
                style={{gridArea: '1 / 3 / 2 / 4'}}
                className="bg-red-700 text-red-100 transition-colors duration-150 hover:bg-red-800">
                <deleteSeriesFetcher.Form method="post" className="h-full flex items-center justify-center">
                    <input
                        type="text"
                        className="hidden"
                        name="id"
                        value={series.id}
                        readOnly
                    />

                    <button
                        className="flex w-full h-full items-center justify-center text-lg font-bold"
                        type="submit"
                        name="_action"
                        value="delete_series"
                    >
                        <AiFillDelete/>
                    </button>
                </deleteSeriesFetcher.Form>
            </div>
        </>
    );
};

export default TableRow;