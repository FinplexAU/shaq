import { RequestEventBase, type RequestHandler } from "@builder.io/qwik-city";
import { type EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import type { Session as ExternalSession, User } from "lucia";
import { Lucia, TimeSpan } from "lucia";
import { drizzleDb } from "~/db/db";
import {
	userEmailVerificationCodes,
	userSessions,
	users,
} from "@/drizzle/schema";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";

export type Token = { expires: Date | string | number; token: string };

type Session = ExternalSession;

export type SharedMap = {
	lucia: ReturnType<typeof initializeLucia>;
	session: Session;
	user: { id: string; email: string; emailVerified: boolean; name: string };
};

export const getSharedMap = <T extends keyof SharedMap>(
	sharedMap: Map<string, any>,
	key: T
): SharedMap[T] => {
	return sharedMap.get(key);
};

export function initializeLucia(adapter: DrizzlePostgreSQLAdapter) {
	return new Lucia(adapter, {
		sessionExpiresIn: new TimeSpan(1, "d"),
		sessionCookie: {
			attributes: {
				secure: import.meta.env.PROD,
			},
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getUserAttributes: ({ hashedPassword, ...attributes }) => {
			return attributes;
		},
		getSessionAttributes: () => {
			return {};
		},
	});
}

declare module "lucia" {
	interface Register {
		Lucia: ReturnType<typeof initializeLucia>;
		DatabaseUserAttributes: InferSelectModel<typeof users>;
	}
}

export const getRequiredEnv = (env: EnvGetter, key: string) => {
	const x = env.get(key);
	if (x === undefined) {
		throw new Error(`ENV KEY ${key} not set`);
	}
	return x;
};

export const generateVerificationCode = async (userId: string) => {
	const db = await drizzleDb;
	await db
		.delete(userEmailVerificationCodes)
		.where(eq(userEmailVerificationCodes.userId, userId));

	const code = generateRandomString(6, alphabet("0-9"));
	await db.insert(userEmailVerificationCodes).values([
		{
			userId: userId,
			code,
			expiresAt: createDate(new TimeSpan(15, "m")),
		},
	]);
	return code;
};

export const getSession = async (
	lucia: Lucia,
	cookie: RequestEventBase["cookie"]
): Promise<
	{ session: null; user: null } | { session: ExternalSession; user: User }
> => {
	const sessionId = cookie.get(lucia.sessionCookieName)?.value;
	if (!sessionId) {
		const result: { session: null; user: null } = {
			session: null,
			user: null,
		};
		return result;
	}

	return await lucia.validateSession(sessionId);
};

export const onRequest: RequestHandler = async (ev) => {
	const db = await drizzleDb;
	const adapter = new DrizzlePostgreSQLAdapter(db, userSessions, users);
	const lucia = initializeLucia(adapter);

	const authPage = ev.pathname.startsWith("/auth/");

	const { session, user } = await getSession(lucia, ev.cookie);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		ev.cookie.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes
		);
	}

	ev.sharedMap.set("lucia", lucia);

	if (!session) {
		if (authPage && ev.pathname !== "/auth/verify-email/") {
			await ev.next();
			return;
		}
		const sessionCookie = lucia.createBlankSessionCookie();
		ev.cookie.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes
		);
		throw ev.redirect(302, "/auth/sign-in");
	}

	if (!user.emailVerified && ev.pathname !== "/auth/verify-email/") {
		throw ev.redirect(302, "/auth/verify-email/");
	}
	if (authPage) {
		throw ev.redirect(302, "/v2/home/");
	}

	ev.sharedMap.set("user", user);
	ev.sharedMap.set("session", session);

	await ev.next();
};
