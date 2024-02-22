import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import type { Redis } from "@upstash/redis";
import { getRequiredEnv, getSharedMap } from "~/routes/plugin";

function parseJwt(t: string) {
  try {
    const base64Url = t.split(".")[1];
    if (!base64Url) throw new Error("Failed to parse jwt: No base64Url");
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse jwt", e);
    return;
  }
}

const fetchNewToken = async (env: EnvGetter, redis: Redis) => {
  try {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getRequiredEnv(env, "CENTRE_CLIENT_ID"),
      client_secret: getRequiredEnv(env, "CENTRE_CLIENT_SECRET"),
    });
    console.log(body.toString());

    const response = await fetch(getRequiredEnv(env, "CENTRE_AUTH_URL"), {
      method: "post",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.ok) {
      console.error(
        response.status,
        "Failed to refresh token:",
        await response.clone().text(),
      );
    }

    const json = await response.json();

    const jwt = parseJwt(json.access_token);
    if (jwt && jwt.exp && typeof jwt.exp === "number") {
      const token: { token: string; expires: number } = {
        token: json.access_token,
        expires: jwt.exp,
      };
      await redis.set("token:centre", token);
      return token;
    }
  } catch (e) {
    console.error("Failed to refresh token:", e);
  }
};

export const getNerveCentreToken = async (
  env: EnvGetter,
  sharedMap: Map<string, any>,
) => {
  const currentTime = Date.now() / 1000;
  const redis = getSharedMap(sharedMap, "redis");
  const token: { expires: number; token: string } | null =
    getSharedMap(sharedMap, "centreToken") ?? (await redis.get("token:centre"));

  if (token) {
    if (token.expires - currentTime > 300) {
      return token;
    }
  }

  const newToken = await fetchNewToken(env, redis);

  sharedMap.set("centreToken", newToken);

  return newToken;
};
