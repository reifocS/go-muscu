import {
  ActionFunction,
  Form,
  LoaderFunction,
  useFetcher,
  useSubmit,
} from "remix";
import { json, Outlet, useLoaderData } from "remix";

import { requireUserId } from "~/session.server";
import {
  createTag,
  deleteTag,
  getAllTags,
  updateTag,
} from "~/models/tag.server";
import { useEffect, useRef } from "react";
import { AiFillDelete, AiFillSave } from "react-icons/ai";
import { toast } from "react-toastify";

type LoaderData = {
  tagList: Awaited<ReturnType<typeof getAllTags>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  let tagList = await getAllTags({ userId });
  return json<LoaderData>({ tagList });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
  if (_action === "edit") {
    const label = formData.get("label");
    const id = formData.get("tag_id");

    if (typeof label !== "string") {
      return json(
        { errors: { exerciseId: "label is required" } },
        { status: 400 }
      );
    }
    if (typeof id !== "string") {
      return json(
        { errors: { exerciseId: "id is required" } },
        { status: 400 }
      );
    }
    return updateTag({ label, id });
  } else if (_action === "add_tag") {
    const label = formData.get("label");
    if (!label || typeof label !== "string") throw new Error("label is empty");
    return createTag({ label, userId });
  } else if (_action === "delete") {
    const tagId = formData.get("tag_id");
    if (typeof tagId !== "string") {
      return json(
        { errors: { exerciseId: "id is required" } },
        { status: 400 }
      );
    }
    return deleteTag({ tagId });
  }
};

export default function TabPage() {
  const data = useLoaderData() as LoaderData;
  const editFetcher = useFetcher();
  const createTagFetcher = useFetcher();
  const tagFormRef = useRef<HTMLFormElement | null>(null);
  let isAddingTag =
    createTagFetcher.state === "submitting" &&
    createTagFetcher.submission.formData.get("_action") === "add_tag";

  useEffect(() => {
    if (!isAddingTag) {
      tagFormRef.current?.reset();
    }
  }, [isAddingTag]);
  useEffect(() => {
    if (editFetcher.submission) {
      toast.success("label edited", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }, [editFetcher.submission]);

  const submit = useSubmit();
  return (
    <main className="overflow-auto">
      <div
        className="m-2 border-l-4 border-green-500 bg-green-100 p-4 text-green-700"
        role="alert"
      >
        <p>
          Tags allow you to categorize your sessions with a label describing its
          content. They are then used to link the workouts together and allow
          you to better understand your progress.
        </p>
      </div>
      <div className="p-2">
        <ul>
          {data.tagList.map((t) => (
            <li key={t.id}>
              <div className="inline-flex w-full p-2">
                <Form
                  method="post"
                  onSubmit={(e) => {
                    if (
                      confirm(
                        `All workouts with tag ${t.label} will have no tag. Are you sure?`
                      )
                    ) {
                      submit(e.currentTarget);
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <input
                    className="hidden"
                    name="tag_id"
                    readOnly
                    value={t.id}
                  ></input>
                  <input
                    name="_action"
                    className="hidden"
                    value="delete"
                    readOnly
                  ></input>
                  <button
                    type="submit"
                    className="focus:shadow-outline flex h-[40px] w-[40px] items-center justify-center rounded-l bg-red-700 text-lg font-bold text-red-100 transition-colors duration-150 hover:bg-red-800"
                  >
                    <AiFillDelete />
                  </button>
                </Form>

                <editFetcher.Form method="post" className="inline-flex w-full">
                  <input
                    className="hidden"
                    name="tag_id"
                    readOnly
                    value={t.id}
                  ></input>
                  <input
                    name="label"
                    key={t.id}
                    className="w-full bg-gray-900 py-1 px-1 text-base text-gray-200 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-200"
                    defaultValue={t.label}
                  />
                  <button
                    name="_action"
                    className="focus:shadow-outline flex h-[40px] w-[50px] items-center justify-center rounded-r bg-blue-500 text-lg font-bold text-blue-100 transition-colors duration-150 hover:bg-blue-600"
                    value="edit"
                    type={"submit"}
                  >
                    <AiFillSave />
                  </button>
                </editFetcher.Form>
              </div>
            </li>
          ))}
        </ul>
        <div className={"flex justify-center"}>
          <createTagFetcher.Form
            method="post"
            ref={tagFormRef}
            className={"mt-2 flex items-center justify-center gap-2 p-2"}
          >
            <div className="relative mb-4">
              <label htmlFor="label" className="text-sm leading-7 text-white">
                Label
              </label>
              <input
                id="label"
                name="label"
                required
                className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <input
              name={"_action"}
              value={"add_tag"}
              className="hidden"
              readOnly
            />
            <button className="mt-2 inline-flex items-center justify-center rounded border-0 bg-indigo-500 py-1 px-4 text-lg text-white hover:bg-indigo-600 focus:outline-none">
              Create tag{" "}
            </button>
          </createTagFetcher.Form>
        </div>
      </div>

      <div className="overflow-auto">
        <Outlet />
      </div>
    </main>
  );
}
