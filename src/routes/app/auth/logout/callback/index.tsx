import type { RequestHandler } from "@builder.io/qwik-city";
import { getSharedMap } from "~/routes/plugin@auth";

export const onGet: RequestHandler = async (ev) => {
  const lucia = getSharedMap(ev.sharedMap, "lucia");
  const session = getSharedMap(ev.sharedMap, "session");

  await lucia.invalidateSession(session.id);
  const cookie = lucia.createBlankSessionCookie();
  ev.cookie.set(cookie.name, cookie.value, cookie.attributes);

  throw ev.redirect(302, "/");
};
