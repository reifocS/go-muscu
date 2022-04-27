import type { LoaderFunction } from "remix";
import { json } from "remix";

export let loader: LoaderFunction = () => {
  return json(
    {
      short_name: "Go muscu",
      name: "Go muscu",
      start_url: "/",
      display: "standalone",
      background_color: "#d3d7dd",
      theme_color: "#374151",
      shortcuts: [
        {
          name: "Homepage",
          url: "/",
          icons: [
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        },
      ],
      icons: [
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/icon-256x256.png",
          sizes: "256x256",
          type: "image/png",
        },
        {
          src: "/icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    }
  );
};
