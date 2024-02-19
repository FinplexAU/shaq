import type { RequestHandler } from "@builder.io/qwik-city";
import { getRequiredEnv, getSharedMap } from "~/routes/plugin@auth";

export const onGet: RequestHandler = (ev) => {
  const session = getSharedMap(ev.sharedMap, "session");

  const baseUrl = getRequiredEnv(ev.env, "AUTH0_APP_DOMAIN");
  const redirectTo = new URL("/app/auth/logout/callback/", ev.url);
  const url = `${baseUrl}/oidc/logout?id_token_hint=${session.idToken}&post_logout_redirect_uri=${redirectTo.toString()}`;

  console.warn("logging out likely needs CSRF protection");

  throw ev.redirect(302, url);
};
