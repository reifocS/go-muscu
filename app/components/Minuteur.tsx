import {CSSProperties, FC} from "react";

type Props = {
    isOpen: boolean;
};

const getStyle = (isOpen: boolean): CSSProperties => {
    if (isOpen) {
        return {
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            overflow: "hidden",
            transition: "all 0.5s",
            backgroundColor: "lightgray",
            zIndex: 9999
        };
    }
    return {
        position: "absolute",
        width: "100%",
        overflow: "hidden",
        transition: "all 0.5s",
        top: "100%",
        height: 0,
        bottom: 0
    };
};

const Minuteur: FC<Props> = ({ children, isOpen }) => {
    return <div style={getStyle(isOpen)}>{children}</div>;
};

export default Minuteur;
