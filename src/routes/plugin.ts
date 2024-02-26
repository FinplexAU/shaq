import {
  z,
  type RequestEvent,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { type EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import { Redis } from "@upstash/redis/cloudflare";
import { Auth0, generateState } from "arctic";
import type { Session as ExternalSession, User as ExternalUser } from "lucia";
import { Lucia, TimeSpan } from "lucia";
import { UpstashRedisAdapter } from "~/redis/adapter";
import createClient from "openapi-fetch";
import type { paths } from "~/__generated__/nerve-centre-schema";
import { getNerveCentreToken } from "~/utils/centre";
import { parseJWT } from "oslo/jwt";

export type Token = { expires: Date | string | number; token: string };

type Session = ExternalSession & { accessToken: Token; idToken: Token };
type User = ExternalUser & UserAttributes;

export type SharedMap = {
  lucia: Lucia;
  auth0: Auth0;
  redis: Redis;
  user: UserAttributes;
  nerveCentre: ReturnType<typeof createClient<paths>>;
  session: Session;
  centreToken: Token | null;
};

export const getSharedMap = <T extends keyof SharedMap>(
  sharedMap: Map<string, any>,
  key: T,
): SharedMap[T] => {
  return sharedMap.get(key);
};

// Refresh tokens last 1 week
// Refresh tokens last 1 day inactive
// If anything expires, show popup for inactivity - Set nearest date to show up

export function initializeLucia(redis: Redis) {
  return new Lucia(UpstashRedisAdapter(redis), {
    sessionExpiresIn: new TimeSpan(1, "d"),
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
    scopes: ["openid", "profile", "email", "offline_access"],
  });
  url.searchParams.set("audience", "https://membrane.nerve.pizza");

  ev.cookie.set(OAUTH_STATE_COOKIE, state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: [1, "days"],
    sameSite: "lax",
  });

  throw ev.redirect(302, url.toString());
};

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

const refreshTokenExpiry = {
  absolute: 2592000000,
  inactivity: 86400000,
} as const;

type RefreshToken = {
  inactivityExpiry: Date | string | number;
  absoluteExpiry: Date | string | number;
  token: string;
};

export const createSession = async (
  redis: Redis,
  lucia: Lucia,
  tokens: {
    accessToken: string;
    idToken: string;
    refreshToken?: string | { token: string; existingToken: RefreshToken };
  },
  existingSessionId?: string,
) => {
  const parsedIdToken = parseJWT(tokens.idToken);
  const parsedAccessToken = parseJWT(tokens.accessToken);
  if (!parsedAccessToken || !parsedAccessToken.expiresAt) {
    console.log("No Access Token Found");
    throw new Error("Failed to get access token");
  }
  if (!parsedIdToken || !parsedIdToken.expiresAt) {
    console.log("No Id Token Found");
    throw new Error("Failed to get id token");
  }

  const accessToken: Token = {
    token: tokens.accessToken,
    expires: parsedAccessToken.expiresAt,
  };
  const idToken: Token = {
    token: tokens.idToken,
    expires: parsedIdToken.expiresAt,
  };

  const payload = await UserAttributes.safeParseAsync(parsedIdToken.payload);

  if (!payload.success) {
    console.log("Failed to parse payload", payload.error.format());
    throw new Error("Failed to parse payload");
  }

  await redis.set(`user:${payload.data.fin}`, {
    id: payload.data.fin,
    attributes: payload.data,
  });

  if (tokens.refreshToken) {
    const key = `refresh-token:${payload.data.fin}`;

    let absoluteExpiry: Date;
    let refreshToken: string;

    if (typeof tokens.refreshToken === "string") {
      absoluteExpiry = new Date(Date.now() + refreshTokenExpiry.absolute);
      refreshToken = tokens.refreshToken;
    } else {
      const existingRefreshToken = tokens.refreshToken.existingToken;
      absoluteExpiry = new Date(existingRefreshToken.absoluteExpiry);
      refreshToken = tokens.refreshToken.token;
    }

    const inactivityExpiry = new Date(
      Date.now() + refreshTokenExpiry.inactivity,
    );
    const redisExpiresAtMs = Math.min(
      absoluteExpiry.getTime(),
      inactivityExpiry.getTime(),
    );

    const refreshTokenRow: RefreshToken = {
      inactivityExpiry,
      absoluteExpiry,
      token: refreshToken,
    };

    await redis.set(key, refreshTokenRow, {
      pxat: redisExpiresAtMs,
    });
  }

  const session = await lucia.createSession(
    payload.data.fin,
    {
      idToken,
      accessToken,
    },
    { sessionId: existingSessionId },
  );
  return session as Session;
};

/**
 * @param token Token
 * @returns Time remaining in ms
 */
const tokenRemainingDuration = (token: Token) => {
  const now = new Date().getTime();
  const tokenExp = new Date(token.expires).getTime();
  return tokenExp - now;
};

export const onRequest: RequestHandler = async (ev) => {
  const redis = new Redis({
    url: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_URL"),
    token: getRequiredEnv(ev.env, "UPSTASH_REDIS_REST_TOKEN"),
  });

  const lucia = initializeLucia(redis);

  const redirectUrl = new URL("/auth/callback/", ev.url);
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

  if (!ev.url.pathname.startsWith("/app/")) {
    await ev.next();
    return;
  }

  const secFetchDest = ev.request.headers.get("sec-fetch-dest");
  const isFullLoad = secFetchDest === "document";

  const sessionId = ev.cookie.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return forceLogin(ev, auth0);
  }

  const v: { session: Session; user: User } | { session: null; user: null } =
    (await lucia.validateSession(sessionId)) as any;

  let session = v.session;
  const user = v.user;

  if (!session) {
    console.log("No Session");
    return forceLogin(ev, auth0);
  }
  if (!user) {
    console.log("No User");
    return forceLogin(ev, auth0);
  }

  // Regenerate Session Token
  if (session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    ev.cookie.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  const accessTokenRemaining = tokenRemainingDuration(session.accessToken);
  const refreshToken: RefreshToken | null = await redis.get(
    `refresh-token:${user.id}`,
  );

  // Attempt to refresh fully when refresh token is close to the absolute expiry.
  // Only attempt on a full page load.
  if (isFullLoad && refreshToken) {
    const absoluteExpiry = new Date(refreshToken.absoluteExpiry).getTime();
    const expiresIn = absoluteExpiry - Date.now();
    if (expiresIn < refreshTokenExpiry.inactivity) {
      console.log("Forcing auth to regenerate refresh token");
      return forceLogin(ev, auth0);
    }
  }

  if (accessTokenRemaining < 30 * 1000) {
    if (refreshToken) {
      try {
        const tokens = await auth0.refreshAccessToken(refreshToken.token);
        console.log("Refreshed Using Refresh Token");
        const newSession = await createSession(
          redis,
          lucia,
          {
            accessToken: tokens.accessToken,
            idToken: tokens.idToken,
            refreshToken: {
              token: tokens.refreshToken,
              existingToken: refreshToken,
            },
          },
          session.id,
        );
        session = newSession;
      } catch (e) {
        console.error(e);

        return forceLogin(ev, auth0);
      }
    }
    // Let the user continue their session until it is fully expired, if there is no hope of refreshing it
    else if (accessTokenRemaining <= 0) {
      return forceLogin(ev, auth0);
    }
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

  ev.sharedMap.set("user", user);
  ev.sharedMap.set("session", session);
  ev.sharedMap.set("nerveCentre", nerveCentre);

  await ev.next();
};
