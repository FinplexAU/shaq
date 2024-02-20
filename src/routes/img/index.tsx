import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (ev) => {
  ev.cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 60 * 60 * 24,
    public: true,
    sMaxAge: 60 * 60 * 24,
  });

  // Will still allow a proxy to use this endpoint, but at that point they may as well do this themselves.
  ev.headers.set(
    "Access-Control-Allow-Origin",
    ev.request.headers.get("Host")!,
  );

  const url = ev.url.searchParams.get("url");
  if (!url) {
    ev.send(400, "Invalid URL");
    return;
  }

  try {
    const parsedUrl = new URL(url);
    try {
      const response = await fetch(parsedUrl);
      ev.send(response);
    } catch (e) {
      ev.send(500, "Internal Server Error");
      return;
    }
  } catch (e) {
    ev.send(400, "Invalid URL");
    return;
  }
};
