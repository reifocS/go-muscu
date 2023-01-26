import {Set} from "~/models/set.server";
import {useFetcher} from "remix";
import {useEffect} from "react";
import {toast} from "react-toastify";
import {Dialog as ReachDialog} from "@reach/dialog";
import * as React from "react";

export default function SeriesNote({open, close, set}: { open: boolean, close: () => void, set?: Set }) {
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === "submitting") {
            close();
            toast.success('Note ajouté 💪', {
                position: "top-right",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        }
    }, [fetcher.state, close])

    return <ReachDialog
        aria-label="edit_note"
        style={{
            maxWidth: '450px',
            borderRadius: '3px',
            paddingBottom: '3.5em',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
            margin: '10vh auto',
            width: "100%",
            backgroundColor: "#374151"
        }}
        isOpen={open} onDismiss={close}>
        <div className="flex">
            <button className="ml-auto font-bold bg-red-500 px-3 py-1 rounded" onClick={close}>x</button>
        </div>
        <label htmlFor="note" className="font-bold mb-2">Ajouter une note 📝</label>
        <fetcher.Form method={"post"}>
            <input
                type="text"
                className="hidden"
                name="setId"
                value={set?.id}
                readOnly
            />
            <textarea
                required
                name="note"
                id="note"
                className="w-full px-3
                            py-1.5
                            text-base
                            font-normal
                            text-gray-700
                            bg-white bg-clip-padding
                            border border-solid border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                defaultValue={set?.note ?? ""}/>
            <input name={"_action"} value={"add_note"} className="hidden" readOnly/>
            <button
                className="flex h-[50px] w-full bg-blue-500 items-center justify-center font-bold text-white"
                type="submit"
            >{set?.note ? "éditer" : "ajouter"}
            </button>
        </fetcher.Form>
    </ReachDialog>
}
