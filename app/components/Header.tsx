import { User } from ".prisma/client";
import { useEffect, useState } from "react";
import { Form, NavLink } from "remix";

export function Header({ user }: { user?: User }) {
  return <Nav loggedIn={user !== undefined} />;
}
const activeStyle = {
  textDecoration: "underline",
};

const Nav = ({ loggedIn }: { loggedIn: boolean }) => {
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    function onResize() {
      setDisplay(true);
    }
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  });

  return (
    <nav className="flex flex-wrap items-center justify-between bg-gray-500 p-6">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        {/*<svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" /></svg>*/}
        <NavLink to="/" className="text-xl font-semibold tracking-tight">
          Workout
        </NavLink>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={() => setDisplay((prev) => !prev)}
          className="flex items-center rounded border border-gray-400 px-3 py-2 text-gray-200 hover:border-white hover:text-white"
        >
          <svg
            className="h-3 w-3 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      {display && (
        <div className="block w-full flex-grow lg:flex lg:w-auto lg:items-center">
          <div className="text-sm lg:flex-grow">
            {loggedIn ? (
              <>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
                  to="/notes"
                >
                  Notes
                </NavLink>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
                  to="/workout"
                >
                  Workout
                </NavLink>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
                  to="/exercises"
                >
                  Exercises
                </NavLink>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="mt-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
                  to="/calendar"
                >
                  Calendar
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
                  to="/join"
                >
                  Sign Up
                </NavLink>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
                  to="/login"
                >
                  Login
                </NavLink>
              </>
            )}
          </div>
          {loggedIn && (
            <div>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="mt-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-gray-500 lg:mt-0"
                >
                  Logout
                </button>
              </Form>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
