import { Link } from "remix";

export default function WorkoutPage() {
  return (
    <p>
      No workout selected. Select a workout on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new workout.
      </Link>
    </p>
  );
}
