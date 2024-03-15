import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { v4 } from "uuid";
import { drizzleDb } from "~/db/db";
import {
	generateVerificationCode,
	getSharedMap,
	sendVerificationCode,
} from "~/routes/plugin";
import { selectFirst } from "~/utils/drizzle-utils";
import { safe } from "~/utils/utils";

export const useSignIn = routeAction$(
	async (data, { sharedMap, redirect, cookie, error }) => {
		const db = await drizzleDb;
		const lucia = getSharedMap(sharedMap, "lucia");

		const user = await safe(
			db
				.select()
				.from(users)
				.where(eq(users.email, data.email))
				.then(selectFirst)
		);

		if (!user.success) {
			return error(400, "Invalid Username or Password");
		}

		const validPassword = await new Argon2id().verify(
			user.hashedPassword,
			data.password
		);

		if (!validPassword) {
			return error(400, "Invalid Username or Password");
		}

		if (!user.emailVerified) {
			const code = await generateVerificationCode(user.id);
			await sendVerificationCode(data.email, code);
		}

		const sessionId = v4();

		const session = await lucia.createSession(
			user.id,
			{},
			{
				sessionId,
			}
		);
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookie.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes
		);

		throw redirect(302, "/v2/home/");
	},
	zod$({
		email: z.string().email(),
		password: z.string().min(8),
	})
);

export default component$(() => {
	const action = useSignIn();
	return (
		<Form action={action}>
			<input name="email" type="text" />
			<input name="password" type="text" />
			<button>Submit</button>
		</Form>
	);
});
