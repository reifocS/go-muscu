import React from "react";
import {ScrollMenu, VisibilityContext} from "react-horizontal-scrolling-menu";

export default function Carrousel({
                                      elementList,
                                      workoutId,
                                      createExerciseFetcher
                                  }: {
    elementList: Array<{ title: string; id: string }>;
    workoutId: string;
    createExerciseFetcher: any
}) {
    return (
        <ScrollMenu
            LeftArrow={LeftArrow}
            RightArrow={RightArrow}
            scrollContainerClassName="lg:flex lg:justify-center"
            itemClassName="flex"
        >
            {elementList.map((el) => (
                <Card
                    itemId={el.id} // NOTE: itemId is required for track items
                    key={el.id}
                    el={el}
                    workoutId={workoutId}
                    createExerciseFetcher={createExerciseFetcher}
                />
            ))}
        </ScrollMenu>
    );
}

function Card({
                  el,
                  itemId,
                  workoutId,
                  createExerciseFetcher
              }: {
    el: { title: string; id: string };
    itemId: string;
    workoutId: string;
    createExerciseFetcher: any
}) {
    return (
        <createExerciseFetcher.Form key={itemId} method="post" tabIndex={0} className="flex">
            <input type="hidden" name="exerciseId" value={el.id}/>
            <input type="hidden" name="workoutId" value={workoutId}/>
            <button
                type="submit"
                name="_action"
                className="focus:shadow-outline m-1 h-[85px] w-[85px] rounded-lg bg-gray-700 text-lg font-bold
          text-white transition-colors duration-150 hover:bg-blue-700"
                value="add_exercise"
            >
                {el.title}
            </button>
        </createExerciseFetcher.Form>
    );
}

function LeftArrow() {
    const {isFirstItemVisible, scrollPrev} =
        React.useContext(VisibilityContext);

    return (
        <button
            className="bg-transparent py-5 px-1"
            disabled={isFirstItemVisible}
            onClick={() => scrollPrev()}
        >
            {"<"}
        </button>
    );
}

function RightArrow() {
    const {isLastItemVisible, scrollNext} = React.useContext(VisibilityContext);

    return (
        <button
            className="bg-transparent py-5 px-1"
            disabled={isLastItemVisible}
            onClick={() => scrollNext()}
        >
            {">"}
        </button>
    );
}
