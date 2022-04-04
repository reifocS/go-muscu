import { Link } from "remix";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <main>
      <h1>Workouts</h1>
      {!user && <Link to="login">Log in</Link>}


    </main>
  );
}
