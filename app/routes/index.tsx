import { Link, redirect } from "remix";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <main className="absolute top-0 h-screen">
      {!user && (
        <div className="flex h-full items-center justify-center justify-center">
          <div className="text-center">
            <p className="p-5">Please log in to use this application.</p>
            <Link
              to="login"
              className="rounded bg-gray-600 px-8 py-2 font-bold"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
