import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link, Form
} from "remix";
import { useOptionalUser } from "~/utils";

import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Go muscu",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  });
};

export default function App() {
  const user = useOptionalUser();
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="">
          {user ? (
            <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
              <h1 className="text-3xl font-bold">
                <Link to="/notes">Notes</Link>
              </h1>
              <h1 className="text-3xl font-bold">
                <Link to="/workout">Workout</Link>
              </h1>
              <h1 className="text-3xl font-bold">
                <Link to="/exercises">Exercises</Link>
              </h1>
              <p>{user.email}</p>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                >
                  Logout
          </button>
              </Form>
            </header>

          ) : (
            <header className="flex items-center bg-slate-800 p-4 text-white">
              <h1 className="font-bold">
                <Link to="/join">Sign up</Link>
              </h1>
              <h1 className="font-bold">
                <Link to="/login">Login</Link>
              </h1>
            </header>
          )}
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
