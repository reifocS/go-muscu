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
import {createExercise} from "~/models/exercise.server";

type DataFormat = Awaited<ReturnType<typeof exportEverything>>

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
        const exerciseMap: Map<Exercise, Exercise> = new Map;
        const exPromises = j!.exercices.map((src) =>
            createExercise({title: src.title, userId}).then(ex => exerciseMap.set(src, ex))
        )
        await Promise.allSettled(exPromises);

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