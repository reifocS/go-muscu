import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import { Form } from "remix";

export default function Carrousel({ elementList }:
  { elementList: Array<{ title: string, id: string }> }) {
  return <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}
    scrollContainerClassName="flex"
    itemClassName="flex"
  >
    {elementList.map((el) => (
      <Card
        itemId={el.id} // NOTE: itemId is required for track items
        key={el.id}
        el={el}

      />
    ))}
  </ScrollMenu>

}



function Card({ el, itemId }: { el: { title: string, id: string }, itemId: string }) {
  return <Form key={itemId} method="post" tabIndex={0} className="flex">
    <input type="hidden" name="exerciseId" value={el.id} />
    <button type="submit" name="_action"
      className="px-5 m-2 text-blue-100 transition-colors duration-150 
          bg-blue-600 rounded-lg focus:shadow-outline hover:bg-blue-700"
      value="add_exercise">
      {el.title}
    </button>
  </Form>
}



function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } =
    React.useContext(VisibilityContext);

  return (
    <button disabled={isFirstItemVisible} onClick={() => scrollPrev()}>
      {"<"}
    </button>
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);

  return (
    <button disabled={isLastItemVisible} onClick={() => scrollNext()}>
      {">"}
    </button>
  );
}