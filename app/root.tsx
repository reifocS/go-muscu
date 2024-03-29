import type {LinksFunction, LoaderFunction, MetaFunction} from "remix";
import {json, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useMatches,} from "remix";
import React from "react";
import {useOptionalUser} from "~/utils";
import reactToastifyCss from "react-toastify/dist/ReactToastify.css";
import tailwindGlobalCss from "./styles/global.css";
import reactResizableCss from "react-resizable/css/styles.css";
import {getUser} from "./session.server";
import {Header} from "./components/Header";
import {ToastContainer} from "react-toastify";
import {CountProvider} from "~/contexts/useTimer";
import Chronometre from "./components/Chronometre";
import dialogCss from "@reach/dialog/styles.css";
import swiperCss from 'swiper/swiper-bundle.min.css';
import styles from "./tailwind.css";

export const links: LinksFunction = () => {
    return [
        {rel: "stylesheet", href: tailwindGlobalCss},
        {rel: "stylesheet", href: reactResizableCss},
        {rel: "stylesheet", href: reactToastifyCss},
        {rel: "stylesheet", href: dialogCss},
        {rel: "stylesheet", href: swiperCss},
        { rel: "stylesheet", href: styles },
    ];
};
export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "Go muscu",
    viewport: "width=device-width,initial-scale=1",
});
type LoaderData = { user: Awaited<ReturnType<typeof getUser>> };
export const loader: LoaderFunction = async ({request}) => {
    return json<LoaderData>({user: await getUser(request)});
};
export default function App() {
    const user = useOptionalUser();
    let location = useLocation();
    let matches = useMatches();

    let isMount = true;
    React.useEffect(() => {
        let mounted = isMount;
        isMount = false;
        if ("serviceWorker" in navigator) {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller?.postMessage({
                    type: "REMIX_NAVIGATION",
                    isMount: mounted,
                    location,
                    matches,
                    manifest: window.__remixManifest,
                });
            } else {
                let listener = async () => {
                    await navigator.serviceWorker.ready;
                    navigator.serviceWorker.controller?.postMessage({
                        type: "REMIX_NAVIGATION",
                        isMount: mounted,
                        location,
                        matches,
                        manifest: window.__remixManifest,
                    });
                };
                navigator.serviceWorker.addEventListener("controllerchange", listener);
                return () => {
                    navigator.serviceWorker.removeEventListener(
                        "controllerchange",
                        listener
                    );
                };
            }
        }
    }, [location]);

    return (
        <html lang="en">
        <head>
            <link rel="manifest" href="/resources/manifest.json"/>
            <Meta/>
            <Links/>
        </head>
        <body className="relative h-screen bg-gray-800 font-mono text-white">
            <Header user={user}/>
            <Outlet/>
        <CountProvider>
            {user && <Chronometre/>}
        </CountProvider>

        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        <ToastContainer
            position="top-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={false}
            theme="dark"
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
        </body>
        </html>
    );
}
