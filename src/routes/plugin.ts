import { type RequestEvent, type RequestHandler } from "@builder.io/qwik-city";
import { type EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import { Redis } from "@upstash/redis/cloudflare";
import { Auth0, generateState } from "arctic";
import type { Session } from "lucia";
import { Lucia, TimeSpan } from "lucia";
import { UpstashRedisAdapter } from "~/redis/adapter";
import type { UserAttributes } from "./app/auth/callback";
import createClient from "openapi-fetch";
import type { paths } from "~/__generated__/nerve-centre-schema";
import { getNerveCentreToken } from "~/utils/centre";

export type SharedMap = {
  lucia: Lucia;
  auth0: Auth0;
  redis: Redis;
  user: UserAttributes;
  nerveCentre: ReturnType<typeof createClient<paths>>;
  session: Session & { idToken: string; accessToken: string };
  centreToken: { expires: number; token: string } | null;
};

export const getSharedMap = <T extends keyof SharedMap>(
  sharedMap: Map<string, any>,
  key: T,
): SharedMap[T] => {
  return sharedMap.get(key);
};

export function initializeLucia(redis: Redis) {
  return new Lucia(UpstashRedisAdapter(redis), {
    sessionExpiresIn: new TimeSpan(4, "m"),
    sessionCookie: {
      attributes: {
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes: (attributes) => {
      return attributes;
    },
    getSessionAttributes: (attributes) => {
      return attributes;
    },
  });
}

declare module "lucia" {
  interface Register {
    Auth: ReturnType<typeof initializeLucia>;
  }
}

export const OAUTH_STATE_COOKIE = "auth0_oauth_state";

export const getRequiredEnv = (env: EnvGetter, key: string) => {
  const x = env.get(key);
  if (x === undefined) {
    throw new Error(`ENV KEY ${key} not set`);
  }
  return x;
};

export const forceLogin = async (ev: RequestEvent, auth0: Auth0) => {
  const state = generateState();
  const url = await auth0.createAuthorizationURL(state, {
    scopes: ["openid", "profile", "email"],
  });
  url.searchParams.set("audience", "https://membrane.nerve.pizza");

  ev.cookie.set(OAUTH_STATE_COOKIE, state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  throw ev.redirect(302, url.toString());
};

export const onRequest: RequestHandler = async (ev) => {
  if (!ev.url.pathname.startsWith("/app/")) {
    return;
  }

  const redis = new Redis({
    url: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_URL"),
    token: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_TOKEN"),
  });

  const lucia = initializeLucia(redis);

  const redirectUrl = new URL("/app/auth/callback/", ev.url);
  redirectUrl.searchParams.set("redirectTo", ev.url.pathname + ev.url.search);

  const auth0 = new Auth0(
    getRequiredEnv(ev.env, "AUTH0_APP_DOMAIN"),
    getRequiredEnv(ev.env, "AUTH0_CLIENT_ID"),
    getRequiredEnv(ev.env, "AUTH0_CLIENT_SECRET"),
    redirectUrl.toString(),
  );

  ev.sharedMap.set("lucia", lucia);
  ev.sharedMap.set("auth0", auth0);
  ev.sharedMap.set("redis", redis);

  if (
    ev.url.pathname === "/app/auth/callback" ||
    ev.url.pathname === "/app/auth/callback/"
  ) {
    await ev.next();
    return;
  }

  const sessionId = ev.cookie.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return forceLogin(ev, auth0);
  }

  const result = await lucia.validateSession(sessionId);
  // Purposefully not handling fresh tokens, as we want to force a refresh to get a new auth0 token

  if (!result.session) {
    return forceLogin(ev, auth0);
  }

  const nerveCentre = createClient<paths>({
    baseUrl: getRequiredEnv(ev.env, "CENTRE_BASE_URL"),
  });
  nerveCentre.use({
    onRequest(req) {
      const ip = ev.request.headers.get("X-Forwarded-For") ?? "127.0.0.1";

      req.headers.set("Nerve-Source-Ip", ip);
      return req;
    },
  });
  nerveCentre.use({
    async onRequest(req) {
      const token = await getNerveCentreToken(ev.env, ev.sharedMap);
      if (!token) return;
      req.headers.set("Authorization", "Bearer " + token.token);
      return req;
    },
  });
  nerveCentre.use({
    async onRequest(req) {
      console.log(req.headers.get("Nerve-Source-Ip"));
      console.log(req.headers.get("Authorization"));
      return req;
    },
    async onResponse(res) {
      const body = await res.clone().json();
      console.log(res.status, body);
      return res;
    },
  });

  ev.sharedMap.set("user", result.user);
  ev.sharedMap.set("session", result.session);
  ev.sharedMap.set("nerveCentre", nerveCentre);

  await ev.next();
};
