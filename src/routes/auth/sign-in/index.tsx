import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { HiKeySolid, HiEnvelopeSolid } from "@qwikest/icons/heroicons";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { v4 } from "uuid";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";
import { AppLink } from "~/routes.config";
import { generateVerificationCode, getSharedMap } from "~/routes/plugin";
import { selectFirst } from "~/utils/drizzle-utils";
import { sendVerificationCode } from "~/utils/email";
import { safe } from "~/utils/utils";

export const useSignIn = routeAction$(
	async (data, { sharedMap, redirect, cookie, error, env }) => {
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
	const action = useSignIn();
	return (
		<>
			<h1 class="pb-4 text-center text-3xl">Sign In</h1>
			<Form action={action} class="flex flex-col py-2">
				<EmailInput />
				<PasswordInput />
				<Button>Sign In</Button>
			</Form>
			<div class="flex w-full justify-end">
				<AppLink route="/auth/sign-up/" class="text-sm text-black/80">
					No account? Sign Up
				</AppLink>
			</div>
		</>
	);
});

export const PasswordInput = component$(() => {
	return (
		<>
			<label
				for="password"
				class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
			>
				Password
			</label>
			<div class="relative mb-6">
				<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
					<HiKeySolid class="h-4 w-4" />
				</div>
				<input
					type="password"
					id="password"
					name="password"
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder="Password"
					required
				/>
			</div>
		</>
	);
});

export const EmailInput = component$(() => {
	return (
		<>
			<label
				for="email"
				class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
			>
				Email
			</label>
			<div class="relative mb-6">
				<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
					<HiEnvelopeSolid class="h-4 w-4" />
				</div>
				<input
					type="email"
					id="email"
					name="email"
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder="name@example.com"
					required
				/>
			</div>
		</>
	);
});
