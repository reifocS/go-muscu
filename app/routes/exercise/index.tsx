import {Link} from "remix";

export default function ExercisePage() {
  return (
    <p>
      No exercise selected. Select an exercise on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new exercise.
      </Link>
    </p>
  );
}
