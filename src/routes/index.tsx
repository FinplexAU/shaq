import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = (request) => {
  throw request.redirect(302, "/app");
};
