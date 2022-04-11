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
} from "remix";
import React from "react";
import { useOptionalUser } from "~/utils";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import tailwindGlobalCss from "./styles/global.css";

import { getUser } from "./session.server";
import { Header } from "./components/Header";
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: tailwindGlobalCss },
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
        <link rel="manifest" href="/manifest/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body className="relative">
        <Header user={user} /> <Outlet /> <ScrollRestoration /> <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
