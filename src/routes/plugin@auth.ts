import { type RequestEvent, type RequestHandler } from "@builder.io/qwik-city";
import { type EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import { Redis } from "@upstash/redis/cloudflare";
import { Auth0, generateState } from "arctic";
import { Lucia } from "lucia";
import { UpstashRedisAdapter } from "~/redis/adapter";
import type { UserAttributes } from "./app/login/callback";

export type SharedMap = {
  lucia: Lucia;
  auth0: Auth0;
  redis: Redis;
  user: UserAttributes;
};

export const getSharedMap = <T extends keyof SharedMap>(
  sharedMap: Map<string, any>,
  key: T,
): SharedMap[T] => {
  return sharedMap.get(key);
};

export function initializeLucia(redis: Redis) {
  return new Lucia(UpstashRedisAdapter(redis), {
    sessionCookie: {
      attributes: {
        secure: import.meta.env.PROD,
      },
    },
    getUserAttributes: (attributes) => {
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

const getRequiredEnv = (env: EnvGetter, key: string) => {
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
  if (ev.url.pathname === "/test/") {
    const redis = new Redis({
      url: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_URL"),
      token: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_TOKEN"),
    });
    const lucia = initializeLucia(redis);
    ev.cookie.set(lucia.sessionCookieName, "hi", {
      path: "/",
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
    ev.json(200, { hi: "bye" });
    return;
  }
  if (!ev.url.pathname.startsWith("/app/")) {
    return;
  }

  const redis = new Redis({
    url: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_URL"),
    token: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_TOKEN"),
  });

  const lucia = initializeLucia(redis);

  const redirectUrl = new URL("/app/login/callback/", ev.url);
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
    ev.url.pathname === "/app/login/callback" ||
    ev.url.pathname === "/app/login/callback/"
  ) {
    console.log("Returning bc callback");
    await ev.next();
    return;
  }

  const sessionId = ev.cookie.get(lucia.sessionCookieName)?.value ?? null;
  console.log(lucia.sessionCookieName);

  console.log("Currently Authorized:", Boolean(sessionId));

  console.log(sessionId);
  if (!sessionId) {
    console.log("No Session id");
    return forceLogin(ev, auth0);
  }

  const result = await lucia.validateSession(sessionId);
  console.log(result);

  try {
    if (!result.session) {
      console.log("No Second Thing");
      return forceLogin(ev, auth0);
    }
    if (result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      console.log("B Session cookie", sessionCookie);
      ev.cookie.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    console.error("something happened with the auth");
  }

  ev.sharedMap.set("user", result.user);

  await ev.next();
};
