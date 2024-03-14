import { users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";

export const useLogIn = routeAction$(
	async (data, { cookie, redirect }) => {
		if (data.id) {
			cookie.set("user", data.id);
		} else if (!cookie.get("user")) {
			const db = await drizzleDb;
			const id = crypto.randomUUID();
			await db.insert(users).values({ id });

			cookie.set("user", id);
		}
		throw redirect(302, "/v2/home");
	},
	zod$({
		id: z.string().nullable(),
	})
);

export default component$(() => {
	const logIn = useLogIn();
	return (
		<div class="flex p-2">
			<pre>{JSON.stringify(logIn.value, null, 2)}</pre>
			<Form action={logIn}>
				<input
					name="id"
					placeholder="user id"
					class="m-2 outline outline-1"
				></input>
				<Button class="text-xs">Log in / create</Button>
			</Form>
		</div>
	);
});
