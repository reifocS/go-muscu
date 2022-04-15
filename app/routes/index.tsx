import { Link, LoaderFunction } from "remix";
import { redirect } from "remix";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  if (user) return redirect("/daily");
  return redirect("/login");
};

export default function Index() {
  return <></>;
}
