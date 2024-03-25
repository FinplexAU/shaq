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
import { Input } from "~/components/input";

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

		if (!code) {
			return error(400, "Invalid OTP");
		}

		if (code.code !== data.otp) {
			return error(400, "Invalid OTP");
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
	const verifyEmail = useVerifyEmail();
	const signOut = useSignOut();
	return (
		<>
			<div class="pb-4 text-center">
				<h1 class="text-3xl">Verify Email</h1>
				<p class="text-black/80">We sent a code to your email</p>
			</div>
			<Form action={verifyEmail} class="flex flex-col py-2">
				<Input
					name="otp"
					type="text"
					autoComplete="off"
					required
					placeholder="000000"
					error={verifyEmail.value?.fieldErrors?.otp}
				/>
				<span class="text-sm text-red-500">
					{verifyEmail.value?.message || verifyEmail.value?.formErrors}
				</span>
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
