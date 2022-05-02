import { useState } from "react";
import Popover from "~/components/Popover";
import { useCountUpdater } from "~/contexts/useTimer";
import { RiTimerLine } from "react-icons/ri";
import { useCountState } from "~/contexts/useTimer";

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
  const [sec, setSeconds] = useState(0);

  const count = useCountState();
  const isTimer = count != null && !count.finished;

  //const [lastTime, setLastTime] = useState<number | null>(null);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  const setTimeAndStore = (time: number) => {
    setTime({ timer: time, finished: false });
    //setLastTime(time);
  };

  return (
    <div>
      <button
        className="absolute bottom-3 right-3 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-blue-500 p-4 font-bold font-bold text-white transition-colors duration-150"
        onClick={open}
      >
        <RiTimerLine className="text-2xl " />
        <p className="text-sm">{isTimer && prettyPrint(count?.timer)}</p>
      </button>

      <Popover isOpen={showDialog}>
        <div className="w-full flex-col items-center justify-center text-right">
          <button
            className="h-8 w-8 self-end rounded-full pt-0.5 text-center text-xl font-bold text-white"
            onClick={close}
          >
            <span aria-hidden>x</span>
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTimeAndStore(min * 60 + sec);
              close();
            }}
          >
            <div className="flex w-full items-center justify-center text-center text-5xl">
              <div className="w-25 mx-1 rounded-lg p-2">
                <label
                  htmlFor="minutes"
                  className="block text-sm font-medium text-gray-200"
                >
                  Minutes
                </label>
                <input
                  name="minutes"
                  value={String(min).padStart(2, "0")}
                  onChange={(e) => setMin(+e.target.value)}
                  type="number"
                  min={0}
                  className="w-full rounded bg-gray-900 text-center font-mono leading-none"
                  max={60}
                  placeholder="min"
                />
              </div>
              <div className="mx-1 text-2xl">:</div>
              <div className="w-25 mx-1 rounded-lg p-2">
                <label
                  htmlFor="seconds"
                  className="block text-sm font-medium text-gray-200"
                >
                  Seconds
                </label>
                <input
                  name="seconds"
                  value={String(sec).padStart(2, "0")}
                  onChange={(e) => setSeconds(+e.target.value)}
                  type="number"
                  className="w-full bg-gray-900 text-center font-mono leading-none"
                  min={0}
                  max={60}
                  placeholder="seconds"
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="m-2 rounded-full bg-gray-700 py-2 px-2 font-bold text-white"
                onClick={() => {
                  setTimeAndStore(90);
                  close();
                }}
              >
                1:30
              </button>
              <button
                type="button"
                className="m-2 rounded-full bg-gray-700  py-2 px-2 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                  setTimeAndStore(2 * 60 + 30);
                  close();
                }}
              >
                2:30
              </button>
              <button
                type="button"
                className="m-2 rounded-full bg-gray-700 py-2 px-2 font-bold text-white hover:bg-gray-800"
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
              mt-2 flex 
              w-full items-center justify-center rounded bg-gray-700 py-2 px-4
              font-bold text-white text-white"
              type="submit"
            >
              START
            </button>
          </form>
        </div>
      </Popover>
    </div>
  );
}
