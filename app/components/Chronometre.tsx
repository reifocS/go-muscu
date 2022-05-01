import {useInterval} from "../../hooks/useInterval";
import {SendNotification} from "~/utils/client/pwa-utils.client";
import {toast} from "react-toastify";
import {useCountState, useCountUpdater} from "~/contexts/useTimer";

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

    return (
        <div className="flex w-full content-center items-center justify-center p-6">
            <h1>{count != null ? prettyPrint(count.timer) : "Timer"}</h1>
        </div>
    );
}
