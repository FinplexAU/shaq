import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { Argon2id } from "oslo/password";
import { v4 } from "uuid";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";
import { AppLink } from "~/routes.config";
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
				name: data.name,
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

		throw redirect(302, "/v2/home/");
	},
	zod$(
		z
			.object({
				email: z.string().email(),
				password: z.string().min(8),
				confirmPassword: z.string().min(8),
				name: z.string().min(2),
			})
			.refine(
				(arg) => arg.password === arg.confirmPassword,
				"Confirm password must equal password"
			)
	)
);

export default component$(() => {
	const action = useSignUp();
	return (
		<>
			<h1 class="pb-4 text-center text-3xl">Sign Up</h1>
			<Form action={action} class="flex flex-col py-2">
				<div class="mb-6">
					<label
						for="name"
						class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>
						Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder="John Doe"
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="email"
						class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>
						Email address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder="john.doe@example.com"
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="password"
						class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder="•••••••••"
						minLength={8}
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="confirmPassword"
						class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>
						Confirm password
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder="•••••••••"
						minLength={8}
						required
					/>
				</div>
				<Button>Sign Up</Button>
			</Form>
			<div class="flex w-full justify-end">
				<AppLink route="/auth/sign-in/" class="text-black/80">
					Already have an account? Sign In
				</AppLink>
			</div>
		</>
	);
});
