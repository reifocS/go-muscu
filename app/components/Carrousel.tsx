import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import { Form } from "remix";

export default function Carrousel({
  elementList,
  workoutId,
}: {
  elementList: Array<{ title: string; id: string }>;
  workoutId: string;
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
        />
      ))}
    </ScrollMenu>
  );
}

function Card({
  el,
  itemId,
  workoutId,
}: {
  el: { title: string; id: string };
  itemId: string;
  workoutId: string;
}) {
  return (
    <Form key={itemId} method="post" tabIndex={0} className="flex">
      <input type="hidden" name="exerciseId" value={el.id} />
      <input type="hidden" name="workoutId" value={workoutId} />
      <button
        type="submit"
        name="_action"
        className="focus:shadow-outline m-2 rounded-lg bg-blue-600 p-5 font-bold
          text-blue-100 transition-colors duration-150 hover:bg-blue-700"
        value="add_exercise"
      >
        {el.title}
      </button>
    </Form>
  );
}

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } =
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
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);

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
