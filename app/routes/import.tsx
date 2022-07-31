import {
    ActionFunction,
    Form,
    json,
    LoaderFunction,
    unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData,
    useActionData
} from "remix";
import {requireUserId} from "~/session.server";
import {exportEverything} from "~/models/user.server";
import {Exercise} from "@prisma/client";
import {createExercise, deleteAllExercise} from "~/models/exercise.server";
import {createWorkout, deleteAllWorkout} from "~/models/workout.server";
import {createSet, deleteAllSet} from "~/models/set.server";
import {createSeries, deleteAllSeries} from "~/models/series.server";

type DataFormat = {
    export: Awaited<ReturnType<typeof exportEverything>>
}
export const loader: LoaderFunction = async ({request}) => {
    await requireUserId(request);

    return json({});
};

export const action: ActionFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const uploadHandler = unstable_createMemoryUploadHandler({
        maxFileSize: 500_000,
        filter: (f) => {
            return f.mimetype === "application/json";
        }
    });
    const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler
    );

    const file = formData.get("data") as File;
    if (file == null) {
        return {
            error: "invalid file"
        }
    }
    const rawText = await file.text();
    try {
        const j = JSON.parse(rawText) as DataFormat;
        const exerciseMap: Map<string, Exercise> = new Map();
        await deleteAllExercise();
        await deleteAllSeries();
        await deleteAllSet();
        await deleteAllWorkout();

        const exPromises = j!.export!.exercices.map((src) =>
            createExercise({title: src.title, userId}).then(ex => exerciseMap.set(src.id, ex))
        )

        await Promise.allSettled(exPromises);

        const workoutPromise = j!.export!.workouts.map(w => {
            createWorkout({date: w.date, userId}).then(newW => {
                w.set.forEach(s => {
                    createSet({workoutId: newW.id, exerciseId: exerciseMap.get(s.exerciseId)!.id})
                        .then(newSet => {
                            s.series.forEach(ser => {
                                createSeries({setId: newSet.id, weigth: ser.weigth, repetitions: ser.repetitions})
                                    .then(newS => console.log(newS))
                            })
                        })
                })
            })
        })
        await Promise.allSettled(workoutPromise);
        return {json: j}
    } catch (e) {
        return {
            error: "Invalid data format"
        }
    }
    return {}
}
const Import = () => {
    const actionData = useActionData();


    return <div>
        importez vos données
        <Form method="post" encType="multipart/form-data">
            <input type="file" name="data" required/>
            <button>Importer</button>
        </Form>
        {actionData?.error && <p>{actionData.error}</p>}
        {actionData?.json && JSON.stringify(actionData?.json)}
    </div>
}

export default Import