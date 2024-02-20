import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (ev) => {
  ev.cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 60 * 60 * 24,
  });

  const url = ev.url.searchParams.get("url");
  if (!url) {
    ev.send(400, "Invalid URL");
    return;
  }

  try {
    const parsedUrl = new URL(url);
    try {
      const response = await fetch(parsedUrl);
      ev.send(response.status, new Uint8Array(await response.arrayBuffer()));
    } catch (e) {
      ev.send(500, "Internal Server Error");
      return;
    }
  } catch (e) {
    ev.send(400, "Invalid URL");
    return;
  }
};
