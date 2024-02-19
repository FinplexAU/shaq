import type { DatabaseSession, Adapter, DatabaseUser } from "lucia";
import type { Redis } from "@upstash/redis/cloudflare";
import { UserAttributes } from "~/routes/app/login/callback";

export const UpstashRedisAdapter = (redis: Redis): Adapter => {
  return {
    async setSession(session) {
      console.log("Set Session");
      const expiresMs = session.expiresAt.getTime();
      await redis.set(`user:${session.userId}:session:${session.id}`, session, {
        pxat: expiresMs,
      });
    },

    // Will be automatically deleted by redis
    async deleteExpiredSessions() {},

    async deleteSession(sessionId) {
      console.log("Delete Session");
      let cursor = 0;
      const keys = [];
      do {
        const [c, k] = await redis.scan(cursor, {
          match: `user:*:session:${sessionId}`,
        });
        cursor = c;
        keys.push(...k);
      } while (cursor !== 0);

      await redis.del(...keys);
    },

    async deleteUserSessions(userId) {
      console.log("Delete user session");
      let cursor = 0;
      const keys = [];
      do {
        const [c, k] = await redis.scan(cursor, {
          match: `user:${userId}:session:*`,
        });
        cursor = c;
        keys.push(...k);
      } while (cursor !== 0);

      await redis.del(...keys);
    },

    async getSessionAndUser(sessionId) {
      console.log("Get Session and user");
      const keys = [];
      let cursor = 0;
      do {
        const [c, k] = await redis.scan(cursor, {
          match: `user:*:session:${sessionId}`,
        });
        cursor = c;
        keys.push(...k);
      } while (cursor !== 0);

      if (keys.length === 0) {
        return [null, null];
      }
      const key = keys[0];
      const session = (await redis.get(key)) as DatabaseSession | null;
      if (session) {
        session.expiresAt = new Date(session.expiresAt);
      }
      console.log("redis session", session);
      let user;

      if (session)
        user = (await redis.get(`user:${session.userId}`)) as DatabaseUser & {
          attributes: UserAttributes;
        };
      else user = null;

      console.log("redis user", user);
      return [session as DatabaseSession, user as DatabaseUser];
    },

    async getUserSessions(userId) {
      console.log("Get user sessions");
      const keys = [];
      let cursor = 0;
      do {
        const [c, k] = await redis.scan(cursor, {
          match: `user:${userId}:session:*`,
        });
        cursor = c;
        keys.push(...k);
      } while (cursor !== 0);

      if (keys.length === 0) {
        return [];
      }

      const getKey = async (key: string) => {
        return await redis.get(key);
      };

      const p = await Promise.allSettled(keys.map(getKey));
      const successful = p
        .filter((x) => x.status === "fulfilled" && x.value)
        .map((x) => {
          const session = (x as { value: DatabaseSession }).value;
          session.expiresAt = new Date(session.expiresAt);
          return session;
        });

      return successful;
    },

    async updateSessionExpiration(sessionId, expiresAt) {
      console.log("Update session expiration");
      const keys = [];
      let cursor = 0;
      do {
        const [c, k] = await redis.scan(cursor, {
          match: `user:*:session:${sessionId}`,
        });
        cursor = c;
        keys.push(...k);
      } while (cursor !== 0);

      for (const key of keys) {
        const value = (await redis.get(key)) as DatabaseSession;
        value.expiresAt = expiresAt;
        await this.setSession(value);
      }
    },
  };
};
