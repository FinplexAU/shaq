import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { Argon2id } from "oslo/password";
import { v4 } from "uuid";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { drizzleDb } from "~/db/db";
import { AppLink } from "~/routes.config";
import { generateVerificationCode, getSharedMap } from "~/routes/plugin";
import { sendVerificationCode } from "~/utils/email";
import { safe } from "~/utils/utils";

export const useSignUp = routeAction$(
	async (data, { fail, sharedMap, redirect, cookie, env }) => {
		const db = await drizzleDb;
		const lucia = getSharedMap(sharedMap, "lucia");

		const hashedPassword = await new Argon2id().hash(data.password);
		const userId = v4();

		const insertResult = await safe(
			db.insert(users).values([
				{
					id: userId,
					name: data.name,
					email: data.email,
					hashedPassword,
				},
			])
		);
		if (!insertResult.success) {
			return fail(500, { message: "Something went wrong during sign up" });
		}
		const code = await generateVerificationCode(userId);
		await sendVerificationCode(env, data.email, code);

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
	const signUp = useSignUp();
	return (
		<>
			<h1 class="pb-4 text-center text-3xl">Sign Up</h1>
			<Form action={signUp} class="flex flex-col gap-6 py-2">
				<Input
					name="name"
					title="Name"
					type="text"
					required
					placeholder="Name"
					error={signUp.value?.fieldErrors?.name}
				/>
				<Input
					name="email"
					type="email"
					title="Email"
					required
					placeholder="Email"
					error={signUp.value?.fieldErrors?.name}
				/>
				<Input
					name="password"
					type="password"
					title="Password"
					required
					placeholder="Password"
					error={signUp.value?.fieldErrors?.password}
				/>
				<Input
					name="confirmPassword"
					type="password"
					title="Confirm Password"
					required
					placeholder="Confirm Password"
					error={signUp.value?.fieldErrors?.password}
				/>
				<Button>Sign Up</Button>
			</Form>
			<span class="text-sm text-red-500">
				{signUp.value?.message || signUp.value?.formErrors}
			</span>
			<div class="flex w-full justify-between">
				<AppLink route="/auth/sign-in/" class="min-w-max text-sm text-black/80">
					Already have an account? Sign In
				</AppLink>
			</div>
		</>
	);
});
