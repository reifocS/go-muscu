import type { LinksFunction, LoaderFunction, MetaFunction } from "remix";
import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useMatches,
  useNavigate,
} from "remix";
import React from "react";
import { useOptionalUser } from "~/utils";
import reactToastifyCss from "react-toastify/dist/ReactToastify.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import tailwindGlobalCss from "./styles/global.css";
import reactResizableCss from "react-resizable/css/styles.css";

import { getUser } from "./session.server";
import { Header } from "./components/Header";
import { IoIosArrowBack } from "react-icons/io";
import { ToastContainer } from "react-toastify";
import { CountProvider } from "~/contexts/useTimer";
import Chronometre from "./components/Chronometre";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: tailwindGlobalCss },
    { rel: "stylesheet", href: reactResizableCss },
    { rel: "stylesheet", href: reactToastifyCss },
  ];
};
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Go muscu",
  viewport: "width=device-width,initial-scale=1",
});
type LoaderData = { user: Awaited<ReturnType<typeof getUser>> };
export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({ user: await getUser(request) });
};
export default function App() {
  const user = useOptionalUser();
  let location = useLocation();
  let matches = useMatches();
  let navigate = useNavigate();

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
        <link rel="manifest" href="/resources/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body className="relative h-screen overflow-hidden bg-gray-800 font-mono text-white">
        <CountProvider>
          <Header user={user} />
          <Outlet />
          <Chronometre />
        </CountProvider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
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
