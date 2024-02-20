import type { DatabaseSession, Adapter, DatabaseUser } from "lucia";
import type { Redis } from "@upstash/redis/cloudflare";
import type { UserAttributes } from "~/routes/app/auth/callback";

export const UpstashRedisAdapter = (redis: Redis): Adapter => {
  return {
    async setSession(session) {
      const expiresMs = session.expiresAt.getTime();
      await redis.set(`user:${session.userId}:session:${session.id}`, session, {
        pxat: expiresMs,
      });
    },

    // Will be automatically deleted by redis
    async deleteExpiredSessions() {},

    async deleteSession(sessionId) {
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
      let user;

      if (session)
        user = (await redis.get(`user:${session.userId}`)) as DatabaseUser & {
          attributes: UserAttributes;
        };
      else user = null;

      return [session as DatabaseSession, user as DatabaseUser];
    },

    async getUserSessions(userId) {
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

    // Don't allow updating expiration as we want to refresh often and never have a stale auth token
    async updateSessionExpiration() {},
  };
};
