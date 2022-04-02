import { User } from ".prisma/client";
import { Form, Link } from "remix";

export function Header({ user }: { user?: User }) {
  return <> {
    user ? (
      <header>
        <h1>
          <Link to="/notes">Notes</Link>
        </h1>
        <h1>
          <Link to="/workout">Workout</Link>
        </h1>
        <h1>
          <Link to="/exercises">Exercises</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
          >
            Logout
                </button>
        </Form>
      </header>
    ) : (
      <header>
        <h1>
          <Link to="/join">Sign up</Link>
        </h1>
        <h1>
          <Link to="/login">Login</Link>
        </h1>
      </header>
    )
  }
  </>
}