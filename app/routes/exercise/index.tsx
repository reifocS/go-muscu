import * as React from "react";
import type {ActionFunction} from "remix";
import {Form, json, redirect, useActionData} from "remix";

import {createExercise} from "~/models/exercise.server";
import {requireUserId} from "~/session.server";

type ActionData = {
    errors?: {
        title?: string;
        description?: string;
    };
};

export const action: ActionFunction = async ({request}) => {
    const userId = await requireUserId(request);

    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");

    if (typeof title !== "string" || title.length === 0) {
        return json<ActionData>(
            {errors: {title: "Title is required"}},
            {status: 400}
        );
    }

    if (typeof description !== "string") {
        return json<ActionData>(
            {errors: {description: "Error in description"}},
            {status: 400}
        );
    }

    const ex = await createExercise({title, userId});

    return redirect(`/exercise/${ex.id}`);
};

export default function NewExercisePage() {
    const actionData = useActionData() as ActionData;
    const titleRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (actionData?.errors?.title) {
            titleRef.current?.focus();
        }
    }, [actionData]);

    return (
        <Form
            method="post"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
            }}
        >
            <div className="p-3">
                <h2 className="text-center font-bold">Ajouter un exercice</h2>
                <label className="flex w-full flex-col py-2">
                    <span>Label: </span>
                    <input
                        ref={titleRef}
                        name="title"
                        className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                        aria-invalid={actionData?.errors?.title ? true : undefined}
                        aria-errormessage={
                            actionData?.errors?.title ? "title-error" : undefined
                        }
                    />
                </label>
                {actionData?.errors?.title && (
                    <div className="pt-1 text-red-700" id="title-error">
                        {actionData.errors.title}
                    </div>
                )}

                <label className="flex w-full flex-col py-2">
                    <span>Description: </span>
                    <textarea
                        name="description"
                        className="w-full rounded bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                        aria-invalid={actionData?.errors?.description ? true : undefined}
                        aria-errormessage={
                            actionData?.errors?.description ? "title-error" : undefined
                        }
                    />
                </label>
                {actionData?.errors?.description && (
                    <div className="pt-1 text-red-700" id="title-error">
                        {actionData.errors.description}
                    </div>
                )}

                <button
                    type="submit"
                    className="my-2 inline-flex w-full items-center justify-center bg-blue-500 p-2 font-bold text-blue-100 transition-colors duration-150 hover:bg-blue-600"
                >
                    Save
                </button>
            </div>
        </Form>
    );
}
