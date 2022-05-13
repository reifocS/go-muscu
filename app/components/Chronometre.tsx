import {useState} from "react";
import {useCountState, useCountUpdater} from "~/contexts/useTimer";
import {RiTimerLine} from "react-icons/ri";
import dayjs from "dayjs";
import TimeSlider from "./TimeSlider";
import {Dialog} from "@reach/dialog";

type Props = {};

function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}

export function prettyPrint(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);
}

export default function Chrono({}: Props) {
    const [showDialog, setShowDialog] = useState(false);
    const setTime = useCountUpdater();
    const [min, setMin] = useState(0);
    const [sec, setSec] = useState(0);

    const count = useCountState();
    const isTimer = count != null && !count.finished;

    const open = () => setShowDialog(true);
    const close = () => setShowDialog(false);

    const setTimeAndStore = (time: number) => {
        setTime({timer: time, finished: false, endTime: dayjs().add(time, "seconds")});
        //setLastTime(time);
    };

    function onSubmit() {
        setTimeAndStore(min * 60 + sec);
        close();
    }


    return (
        <div>
            <button
                className="absolute bottom-3 right-3 flex h-[60px] w-[60px] flex-col items-center justify-center rounded-full bg-blue-500 p-4 font-bold font-bold text-white transition-colors duration-150"
                onClick={open}
            >
                <RiTimerLine className="h-full min-h-[20px] w-full min-w-[20px] text-2xl "/>
                <p className="text-sm">{isTimer && prettyPrint(count?.timer)}</p>
            </button>

            <Dialog aria-label={"chrono"} style={{
                backgroundColor: "#374151",
                maxWidth: '450px',
                opacity: 1,
                borderRadius: '14px',
                paddingBottom: '3.5em',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
                margin: '10vh auto',
                width: "100%",
            }} isOpen={showDialog}>
                <div className="w-full flex-col items-center justify-center text-right">
                    <button
                        className="h-8 w-8 self-end rounded-full pt-0.5 text-center text-xl font-bold text-white"
                        onClick={close}
                    >
                        <span aria-hidden>x</span>
                    </button>
                    <div className="w-full">
                        <TimeSlider setMin={setMin} setSec={setSec}/>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            className="m-2 rounded-full bg-blue-700 hover:bg-blue-800 py-2 px-2 font-bold text-white"
                            onClick={() => {
                                setTimeAndStore(90);
                                close();
                            }}
                        >
                            1:30
                        </button>
                        <button
                            type="button"
                            className="m-2 rounded-full bg-blue-700  py-2 px-2 font-bold text-white hover:bg-blue-800"
                            onClick={() => {
                                setTimeAndStore(2 * 60 + 30);
                                close();
                            }}
                        >
                            2:30
                        </button>
                        <button
                            type="button"
                            className="m-2 rounded-full bg-blue-700 py-2 px-2 font-bold text-white hover:bg-blue-800"
                            onClick={() => {
                                setTimeAndStore(3 * 60 + 30);
                                close();
                            }}
                        >
                            3:30
                        </button>
                    </div>

                    <button
                        className="
              mt-2 flex hover:bg-blue-800
              w-full items-center justify-center rounded bg-blue-700 py-3 px-4
              font-bold text-white text-white"
                        onClick={onSubmit}
                    >
                        START
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
