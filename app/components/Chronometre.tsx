import {useCountState} from "~/contexts/useTimer";
import {RiTimerLine} from "react-icons/ri";

type Props = {};

function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}

export function prettyPrint(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);
}

export default function Chronometre({}: Props) {
    const count = useCountState();
    const isTimer = count != null && !count.finished;
    return (
        <div className={isTimer ? "text-lg": "text-2xl"}>{isTimer? prettyPrint(count.timer) : <RiTimerLine/>}</div>
    );
}
