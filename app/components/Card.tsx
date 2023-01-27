import * as React from "react";

export default function Card({
                                 el,
                                 itemId,
                                 workoutId,
                                 createExerciseFetcher,
                             }: {
    el: { title: string; id: string };
    itemId: string;
    workoutId: string;
    createExerciseFetcher: any;
}) {
    return (
        <createExerciseFetcher.Form
            key={itemId}
            method="post"
            tabIndex={0}
            className="flex"
        >
            <input type="hidden" name="exerciseId" value={el.id}/>
            <input type="hidden" name="workoutId" value={workoutId}/>
            <button
                type="submit"
                name="_action"
                className="focus:shadow-outline m-1 py-2 h-[85px] w-[85px] rounded-lg bg-gray-700 text-ellipsis
                font-bold break-words overflow-hidden wordtext-white transition-colors duration-150 hover:bg-gray-800"
                value="add_exercise"
            >
                {el.title}
            </button>
        </createExerciseFetcher.Form>
    );
}