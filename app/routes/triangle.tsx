import {LoaderFunction} from "remix";
import {useEffect, useMemo, useState} from "react";

const TARGET = 25;
const LIMIT = 500;

export const loader: LoaderFunction = async () => {
    return {};
};


export default function App() {
    const TriangleDemo = () => {
        const [elapsed, setElapsed] = useState(0)
        const [seconds, setSeconds] = useState(0)
        const scale = useMemo(() => {
            const e = (elapsed / 1000) % 10;
            return 1 + (e > 5 ? 10 - e : e) / 10;
        }, [elapsed])


        useEffect(() => {
            let start = Date.now();
            let f: number;
            let t: NodeJS.Timer;
            const update = () => {
                setElapsed(Date.now() - start);
                f = requestAnimationFrame(update);
            };
            f = requestAnimationFrame(update);
            t = setInterval(() => setSeconds(prev => (prev % 10) + 1), 1000);
            return () => {
                clearInterval(t);
                cancelAnimationFrame(f);
            }
        }, [])

        return (
            <div
                className="container"
                style={{
                    transform: "scaleX(" + scale / 2.1 + ") scaleY(0.7) translateZ(0.1px)"
                }}
            >
                <Triangle x={0} y={0} s={LIMIT} seconds={seconds}/>
            </div>
        );
    };

    const Triangle = ({x, y, s, seconds}: { x: number, y: number; s: number, seconds: number }) => {

        if (s <= TARGET) {
            return (
                <Dot x={x - TARGET / 2} y={y - TARGET / 2} s={TARGET} text={seconds}/>
            );
        }
        s = s / 2;

        return (
            <>
                <Triangle x={x} y={y - s / 2} s={s} seconds={seconds}/>
                <Triangle x={x - s} y={y + s / 2} s={s} seconds={seconds}/>
                <Triangle x={x + s} y={y + s / 2} s={s} seconds={seconds}/>
            </>
        );
    };

    const Dot = ({x, y, s, text}: { x: number, y: number; s: number, text: number }) => {
        const [hover, setHover] = useState(false);
        return (
            <div
                className="dot"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    width: s + "px",
                    height: s + "px",
                    left: x + "px",
                    top: y + "px",
                    borderRadius: s / 2 + "px",
                    lineHeight: s + "px",
                    background: hover ? "gray" : "#61dafb"
                }}
            >{text}</div>
        );
    };

    return <TriangleDemo/>;
}
