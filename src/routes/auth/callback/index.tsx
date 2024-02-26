import { OAuth2RequestError } from "arctic";
import { type RequestHandler } from "@builder.io/qwik-city";
import {
  OAUTH_STATE_COOKIE,
  createSession,
  getSharedMap,
} from "~/routes/plugin";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button";

export const onGet: RequestHandler = async (ev) => {
  const code = ev.url.searchParams.get("code");
  const state = ev.url.searchParams.get("state");
  const storedState = ev.cookie.get(OAUTH_STATE_COOKIE) ?? null;

  if (!code || !state || !storedState || state !== storedState.value) {
    console.log("Code Set:", !!code);
    console.log("State Set:", !!state);
    console.log("Stored State Set:", !!storedState);
    console.log("Stored State and State Match:", state === storedState?.value);

    ev.cookie.delete(OAUTH_STATE_COOKIE, { path: "/" });

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

  ev.cookie.delete(OAUTH_STATE_COOKIE, { path: "/" });

  if (redirectLocation.origin !== ev.url.origin) {
    throw ev.redirect(302, "/");
  }

  throw ev.redirect(302, redirectLocation.toString());
};

export default component$(() => {
  return (
    <div class="grid h-screen place-items-center">
      <div class="max-w-sm rounded-lg border p-6 text-center">
        <h1 class="pb-2 text-3xl font-bold">Authentication Failure</h1>
        <p class="pb-8 text-black text-opacity-60">
          Sorry, an issue occurred while ensuring you have access to this page.
          If this issue persists, please contact support.
        </p>
        <a href="/app/">
          <Button class="w-full">Retry Login</Button>
        </a>
      </div>
    </div>
  );
});
