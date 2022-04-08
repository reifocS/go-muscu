import { User } from ".prisma/client";
import { useState } from "react";
import { Form, NavLink } from "remix";

export function Header({ user }: { user?: User }) {
  return <Nav loggedIn={user !== undefined} />;
}
const activeStyle = {
  textDecoration: "underline",
};

const links = ["Notes", "Exercise", "Calendar", "Daily"];

const Nav = ({ loggedIn }: { loggedIn: boolean }) => {
  const [display, setDisplay] = useState(false);

  return (
    <div>
      <div className="pt-[40px]"></div>

      <nav className="absolute top-0 z-20 w-full md:flex md:flex-wrap">
        <div className="flex flex-wrap items-center justify-between bg-blue-500 p-2">
          <div className="mr-6 flex flex-shrink-0 items-center text-white">
            {/*<svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" /></svg>*/}
            <NavLink to="/" className="text-xl font-semibold tracking-tight">
              GO MUSCU!!
            </NavLink>
          </div>
          <div className="block md:hidden">
            <button
              onClick={() => setDisplay((prev) => !prev)}
              className="hover:text-gray flex items-center rounded border border-gray-400 px-5 py-2 text-white hover:border-white"
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
        </div>

        <div
          className={`${
            !display && "hidden md:block"
          } block w-full flex-grow bg-blue-400 md:flex md:w-auto md:items-center`}
        >
          <div className="text-sm md:flex-grow">
            {loggedIn ? (
              <>
                {links.map((l) => (
                  <NavLink
                    key={l}
                    style={({ isActive }) => (isActive ? activeStyle : {})}
                    onClick={() => setDisplay(false)}
                    className="hover:text-gray block px-5 py-1 text-white md:inline-block md:py-3 "
                    to={`/${l.toLowerCase()}`}
                  >
                    {l}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                <NavLink
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  onClick={() => setDisplay(false)}
                  className="block px-5 py-1 text-gray-200 hover:text-white md:inline-block md:py-3"
                  to="/join"
                >
                  Sign Up
                </NavLink>
                <NavLink
                  onClick={() => setDisplay(false)}
                  style={({ isActive }) => (isActive ? activeStyle : {})}
                  className="block px-5 py-1 text-gray-200 hover:text-white md:inline-block md:py-3"
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
                  className="mx-5 my-2 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-gray-500 md:my-0 md:mt-0"
                >
                  Logout
                </button>
              </Form>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
