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
	async (data, { sharedMap, redirect, cookie, env, fail }) => {
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
			return fail(400, {
				message: "Incorrect email or password.",
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
			<Form action={signIn} class="flex flex-col py-2">
				<EmailInput error={signIn.value?.fieldErrors?.email?.at(0)} />
				<PasswordInput error={signIn.value?.fieldErrors?.password?.at(0)} />

				<Button>Sign In</Button>
			</Form>

			<div class="flex w-full justify-between">
				<span class="text-sm text-red-500">
					{signIn.value?.failed && signIn.value.message}
				</span>
				<AppLink route="/auth/sign-up/" class="min-w-max text-sm text-black/80">
					No account? Sign Up
				</AppLink>
			</div>
		</>
	);
});

export const PasswordInput = component$((props: { error?: string }) => {
	return (
		<div class="relative pb-6">
			<label
				for="password"
				class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
			>
				Password
			</label>
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
					<HiKeySolid class="h-4 w-4" />
				</div>
				<input
					type="password"
					id="password"
					name="password"
					class={[
						"block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
						{
							"outline outline-red-700": props.error,
						},
					]}
					placeholder="Password"
					required
				/>
			</div>
			{props.error && (
				<span class="absolute text-sm text-red-500">Invalid password.</span>
			)}
		</div>
	);
});

export const EmailInput = component$((props: { error?: string }) => {
	return (
		<div class="relative pb-6">
			<label
				for="email"
				class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
			>
				Email
			</label>
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
					<HiEnvelopeSolid class="h-4 w-4" />
				</div>
				<input
					type="email"
					id="email"
					name="email"
					class={[
						"block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
						{
							"outline outline-red-700": props.error,
						},
					]}
					placeholder="name@example.com"
					required
				/>
			</div>
			{props.error && (
				<span class="absolute text-sm text-red-500">{props.error}</span>
			)}
		</div>
	);
});
