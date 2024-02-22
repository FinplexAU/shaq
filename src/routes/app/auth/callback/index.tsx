import { OAuth2RequestError } from "arctic";
import { z, type RequestHandler } from "@builder.io/qwik-city";
import { OAUTH_STATE_COOKIE, getSharedMap } from "~/routes/plugin";
import { parseJWT } from "oslo/jwt";

const UserAttributes = z.object({
  fin: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  nickname: z.string().optional(),
  name: z.string(),
  picture: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
});
export type UserAttributes = z.infer<typeof UserAttributes>;

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
    const idToken = parseJWT(tokens.idToken);

    const payload = await UserAttributes.safeParseAsync(idToken?.payload);

    if (!payload.success) {
      console.log("Failed to parse payload", payload.error.format());
      ev.send(500, "");
      return;
    }

    const redis = getSharedMap(ev.sharedMap, "redis");
    await redis.set(`user:${payload.data.fin}`, {
      id: payload.data.fin,
      attributes: payload.data,
    });

    const session = await lucia.createSession(payload.data.fin, {
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
    });
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
