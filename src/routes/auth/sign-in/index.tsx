import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { HiKeySolid, HiEnvelopeSolid } from "@qwikest/icons/heroicons";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { v4 } from "uuid";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { drizzleDb } from "~/db/db";
import { AppLink } from "~/routes.config";
import { generateVerificationCode, getSharedMap } from "~/routes/plugin";
import { sendVerificationCode } from "~/utils/email";

export const useSignIn = routeAction$(
	async (data, { sharedMap, redirect, cookie, env, fail }) => {
		const db = await drizzleDb;
		const lucia = getSharedMap(sharedMap, "lucia");

		const user = await db.query.users.findFirst({
			where: eq(users.email, data.email),
		});

		if (!user) {
			return fail(400, {
				message: "Incorrect email or password",
			});
		}

		const validPassword = await new Argon2id().verify(
			user.hashedPassword,
			data.password
		);

		if (!validPassword) {
			return fail(400, {
				message: "Incorrect email or password.",
			});
		}

		if (!user.emailVerified) {
			const code = await generateVerificationCode(user.id);
			await sendVerificationCode(env, data.email, code);
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
	const signIn = useSignIn();
	return (
		<>
			<h1 class="pb-4 text-center text-3xl">Sign In</h1>
			<Form action={signIn} class="flex flex-col gap-6 py-2">
				<Input
					name="email"
					type="email"
					required
					placeholder="Email"
					error={signIn.value?.fieldErrors?.email}
				/>
				<Input
					name="password"
					type="password"
					required
					placeholder="Password"
					error={signIn.value?.fieldErrors?.password}
				/>

				<Button>Sign In</Button>
			</Form>

			<span class="text-sm text-red-500">
				{signIn.value?.message || signIn.value?.formErrors}
			</span>
			<div class="flex w-full justify-between">
				<AppLink route="/auth/sign-up/" class="min-w-max text-sm text-black/80">
					No account? Sign Up
				</AppLink>
			</div>
		</>
	);
});
