import React from "react";
import { useInterval } from "../../hooks/useInterval";
import { SendNotification } from "~/utils/client/pwa-utils.client";
import { toast } from "react-toastify";

type CounterState = { timer: number; finished: boolean } | null;
type CounterDispatch = React.Dispatch<React.SetStateAction<CounterState>>;
const CountStateContext = React.createContext<CounterState>(null);
const CountUpdaterContext = React.createContext<CounterDispatch>(() => {});

function CountProvider(props: any) {
  const [count, setCount] = React.useState<CounterState>(null);

  useInterval(() => {
    if (count === null) return;
    if (count.timer > 0) {
      setCount((prev) =>
        prev ? { finished: false, timer: prev.timer - 1 } : prev
      );
    } else {
      if (!count.finished) {
        SendNotification("Go muscu", {
          body: "Allez hop !",
          badge: "/icons/icon-192x192.png",
          icon: "/icons/icon-192x192.png",
          silent: false,
          vibrate: [200, 100, 200],
        });
        toast.success("Au boulot 💪 !!!!", {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          autoClose: false,
          progress: undefined,
        });
        setCount((prev) => (prev ? { ...prev, finished: true } : prev));
      }
    }
  }, 1000);

  return (
    <CountStateContext.Provider value={count}>
      <CountUpdaterContext.Provider value={setCount}>
        {props.children}
      </CountUpdaterContext.Provider>
    </CountStateContext.Provider>
  );
}

function useCountState() {
  const countState = React.useContext(CountStateContext);
  if (typeof countState === "undefined") {
    throw new Error("useCountState must be used within a CountProvider");
  }
  return countState;
}

function useCountUpdater() {
  const setCount = React.useContext(CountUpdaterContext);
  if (typeof setCount === "undefined") {
    throw new Error("useCountUpdater must be used within a CountProvider");
  }
  return setCount;
}

export { CountProvider, useCountState, useCountUpdater };
