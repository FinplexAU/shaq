import { OAuth2RequestError } from "arctic";
import { type RequestHandler } from "@builder.io/qwik-city";
import {
  OAUTH_STATE_COOKIE,
  createSession,
  getSharedMap,
} from "~/routes/plugin";

export const onGet: RequestHandler = async (ev) => {
  const code = ev.url.searchParams.get("code");
  const state = ev.url.searchParams.get("state");
  const storedState = ev.cookie.get(OAUTH_STATE_COOKIE) ?? null;
  ev.cookie.delete(OAUTH_STATE_COOKIE, {
    path: "/",
  });

  if (!code || !state || !storedState || state !== storedState.value) {
    ev.send(400, "");
    return;
  }

  const auth0 = getSharedMap(ev.sharedMap, "auth0");
  const lucia = getSharedMap(ev.sharedMap, "lucia");

  try {
    const tokens = await auth0.validateAuthorizationCode(code);

    const redis = getSharedMap(ev.sharedMap, "redis");
    const session = await createSession(redis, lucia, tokens);
    const sessionCookie = lucia.createSessionCookie(session.id);

    ev.cookie.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      ev.send(400, "");
      return;
    }
    console.error(e);
    ev.send(500, "");
    return;
  }

  const redirectTo = ev.url.searchParams.get("redirectTo");
  const redirectLocation = new URL(redirectTo || "/", ev.url);

  if (redirectLocation.origin !== ev.url.origin) {
    throw ev.redirect(302, "/");
  }

  throw ev.redirect(302, redirectLocation.toString());
};
