import { userEmailVerificationCodes, users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { getSharedMap } from "~/routes/plugin";
import { HiKeySolid } from "@qwikest/icons/heroicons";
import { Button } from "~/components/button";
import { useSignOut } from "~/routes/layout";

export const useVerifyEmail = routeAction$(
	async (data, { sharedMap, error, redirect }) => {
		const db = await drizzleDb;
		const user = getSharedMap(sharedMap, "user");

		if (user.emailVerified) {
			return error(400, "Email already verified");
		}

		const code = await db.query.userEmailVerificationCodes.findFirst({
			where: eq(userEmailVerificationCodes.userId, user.id),
		});

		console.log(code);
		if (!code) {
			return error(400, "Invalid code");
		}

		if (code.code !== data.otp) {
			return error(400, "Invalid otp");
		}

		await db
			.delete(userEmailVerificationCodes)
			.where(eq(userEmailVerificationCodes.userId, user.id));
		await db
			.update(users)
			.set({
				emailVerified: true,
			})
			.where(eq(users.id, user.id));

		throw redirect(302, "/v2/home/");
	},
	zod$({
		otp: z.string(),
	})
);

export const onRequest: RequestHandler = async ({ redirect, sharedMap }) => {
	const user = getSharedMap(sharedMap, "user");
	if (user.emailVerified) {
		throw redirect(302, "/v2/home/");
	}
};

export default component$(() => {
	const action = useVerifyEmail();
	const signOut = useSignOut();
	return (
		<>
			<div class="pb-4 text-center">
				<h1 class="text-3xl">Verify Email</h1>
				<p class="text-black/80">We sent a code to your email</p>
			</div>
			<Form action={action} class="flex flex-col py-2">
				<OTPInput />
				<Button>Verify</Button>
			</Form>
			<div class="flex w-full justify-between">
				<Form action={signOut}>
					<button class="text-sm text-black/80">Sign out</button>
				</Form>
				<button class="text-sm text-black/80">Cant find email? Resend</button>
			</div>
		</>
	);
});

export const OTPInput = component$(() => {
	return (
		<>
			<label
				for="otp"
				class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
			>
				One Time Password
			</label>
			<div class="relative mb-6">
				<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
					<HiKeySolid class="h-4 w-4" />
				</div>
				<input
					type="text"
					id="otp"
					name="otp"
					autocomplete="off"
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder="000000"
					maxLength={6}
					minLength={6}
					required
				/>
			</div>
		</>
	);
});
