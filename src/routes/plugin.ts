import { type RequestHandler } from "@builder.io/qwik-city";
import { type EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import type { Session as ExternalSession } from "lucia";
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
	user: { id: string; email: string; emailVerified: boolean };
};

export const getSharedMap = <T extends keyof SharedMap>(
	sharedMap: Map<string, any>,
	key: T
): SharedMap[T] => {
	return sharedMap.get(key);
};

// Refresh tokens last 1 week
// Refresh tokens last 1 day inactive
// If anything expires, show popup for inactivity - Set nearest date to show up

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

export const sendVerificationCode = async (email: string, code: string) => {
	console.log(email, code);
};

export const generateVerificationCode = async (userId: string) => {
	const db = await drizzleDb;
	await db
		.delete(userEmailVerificationCodes)
		.where(eq(userEmailVerificationCodes.userId, userId));

	const code = generateRandomString(8, alphabet("0-9"));
	await db.insert(userEmailVerificationCodes).values([
		{
			userId: userId,
			code,
			expiresAt: createDate(new TimeSpan(15, "m")),
		},
	]);
	return code;
};

export const onRequest: RequestHandler = async (ev) => {
	const db = await drizzleDb;
	const adapter = new DrizzlePostgreSQLAdapter(db, userSessions, users);
	const lucia = initializeLucia(adapter);

	ev.sharedMap.set("lucia", lucia);

	if (!ev.pathname.startsWith("/v2/")) {
		await ev.next();
		return;
	}

	const sessionId = ev.cookie.get(lucia.sessionCookieName)?.value;
	if (!sessionId) {
		throw ev.redirect(302, "/auth/sign-in");
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		ev.cookie.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes
		);
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		ev.cookie.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes
		);
		throw ev.redirect(302, "/auth/sign-in");
	}

	ev.sharedMap.set("user", user);
	ev.sharedMap.set("session", session);

	await ev.next();
};
