import { useInterval } from "../../hooks/useInterval";
import { useRef } from "react";
import { SendNotification } from "~/utils/client/pwa-utils.client";
import {MdReplay} from "react-icons/md";

type Props = {
  setCount: (number: number) => void;
  count: number | null;
  lastTime: number | null;
};

function str_pad_left(string: number, pad: string, length: number) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

function prettyPrint(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);
}

export default function Chronometre({ setCount, count, lastTime }: Props) {
  const isFinished = useRef(true);
  useInterval(() => {
    if (count === null) return;
    if (count > 0) {
      setCount(count - 1);
      isFinished.current = false;
    } else {
      if (!isFinished.current) {
        SendNotification("Go muscu!", {
          body: "Back to work!",
          badge: "/icons/icon-192x192.png",
          silent: false, vibrate: [200, 100, 200]
        });
        isFinished.current = true;
      }
    }
  }, 1000);

  return (
    <div className="flex w-full content-center items-center justify-center p-6">
      <h1>{count != null ? prettyPrint(count) : "<no timer>"}</h1>
      {lastTime && (
        <button
            className="mx-2"
          onClick={() => {
            setCount(lastTime);
          }}
        >
          <MdReplay/>
        </button>
      )}
    </div>
  );
}
