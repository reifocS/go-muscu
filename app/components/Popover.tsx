import { FC } from "react";

type Props = {
  isOpen: boolean;
};

const Minuteur: FC<Props> = ({ children, isOpen }) => {
  return (
    <div
      className={`absolute top-0 z-10 h-screen w-full overflow-hidden bg-[#00000080] px-[20px] pt-[100px] ${
        !isOpen && "hidden"
      }`}
    >
      <div className="h-[100%] w-full rounded-lg bg-gray-800 p-2">
        {children}
      </div>
    </div>
  );
};

export default Minuteur;
