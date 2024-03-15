import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { Argon2id } from "oslo/password";
import { v4 } from "uuid";
import { drizzleDb } from "~/db/db";
import {
	generateVerificationCode,
	getSharedMap,
	sendVerificationCode,
} from "~/routes/plugin";

export const useSignUp = routeAction$(
	async (data, { sharedMap, redirect, cookie }) => {
		const db = await drizzleDb;
		const lucia = getSharedMap(sharedMap, "lucia");

		const hashedPassword = await new Argon2id().hash(data.password);
		const userId = v4();

		await db.insert(users).values([
			{
				id: userId,
				email: data.email,
				hashedPassword,
			},
		]);
		const code = await generateVerificationCode(userId);
		await sendVerificationCode(data.email, code);

		const session = await lucia.createSession(
			userId,
			{},
			{
				sessionId: v4(),
			}
		);
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookie.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes
		);

		throw redirect(302, "/v2/");
	},
	zod$({
		email: z.string().email(),
		password: z.string().min(8),
	})
);

export default component$(() => {
	const action = useSignUp();
	return (
		<Form action={action}>
			<input name="email" type="text" />
			<input name="password" type="text" />
			<button>Submit</button>
		</Form>
	);
});
