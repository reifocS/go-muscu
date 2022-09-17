import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";

export default function Carrousel({
  elementList,
  workoutId,
  createExerciseFetcher,
  Card,
}: {
  elementList: Array<{ title: string; id: string }>;
  workoutId?: string;
  createExerciseFetcher: any;
  Card: React.FC<any>;
}) {
  return (
    <ScrollMenu
      LeftArrow={LeftArrow}
      RightArrow={RightArrow}
      scrollContainerClassName="flex lg:justify-center"
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

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } =
    React.useContext(VisibilityContext);

  return (
    <button
      className="bg-transparent py-5 px-2"
      disabled={isFirstItemVisible}
      onClick={() => scrollPrev()}
    >
      {"<"}
    </button>
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);

  return (
    <button
      className="bg-transparent py-5 px-2"
      disabled={isLastItemVisible}
      onClick={() => scrollNext()}
    >
      {">"}
    </button>
  );
}
