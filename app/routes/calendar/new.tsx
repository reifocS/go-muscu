import dayjs from "dayjs";
import {Link, useSearchParams} from "remix";

export default function NewWorkout() {
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");

  return (
    <div className="absolute h-80 w-full bg-red-500">
      <div>
        new at {dayjs(date).format("DD/MM")}
        <br></br>
        <Link to="..">back</Link>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}
