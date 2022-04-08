import { Link, redirect } from "remix";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return <main>{!user && <Link to="login">Log in</Link>}</main>;
}
