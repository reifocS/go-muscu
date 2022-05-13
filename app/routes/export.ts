import {json, LoaderFunction} from "remix";
import {requireUserId} from "~/session.server";
import {exportEverything} from "~/models/user.server";

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const data = await exportEverything(userId);
    return json({export: data});
};
