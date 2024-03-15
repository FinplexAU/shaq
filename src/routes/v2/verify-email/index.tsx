import { userEmailVerificationCodes, users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { getSharedMap } from "~/routes/plugin";
import { selectFirst } from "~/utils/drizzle-utils";
import { safe } from "~/utils/utils";

export const useVerifyEmail = routeAction$(
	async (data, { sharedMap, error, redirect }) => {
		const db = await drizzleDb;
		const user = getSharedMap(sharedMap, "user");

		if (user.emailVerified) {
			return error(400, "Email already verified");
		}

		const code = await safe(
			db
				.select()
				.from(userEmailVerificationCodes)
				.where(eq(userEmailVerificationCodes.userId, user.id))
				.then(selectFirst)
		);

		if (!code.success) {
			return error(400, "Invalid code");
		}

		if (code.code !== data.code) {
			return error(400, "Invalid code");
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
		code: z.string(),
	})
);

export default component$(() => {
	const verifyEmail = useVerifyEmail();
	return (
		<Form action={verifyEmail}>
			<input name="code"></input>
			<button type="submit">Submit</button>
		</Form>
	);
});
