import { contracts, entities, userEntityLinks } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { eq, inArray } from "drizzle-orm";
import { drizzleDb } from "~/db/db";

export const useUserEntities = routeLoader$(async ({ cookie, redirect }) => {
	const db = await drizzleDb;
	const user = cookie.get("user");
	if (!user) {
		console.warn("no user cookie");
		throw redirect(302, "/v2/");
	}
	const usersEntities = await db
		.select({
			id: entities.id,
		})
		.from(entities)
		.leftJoin(userEntityLinks, eq(entities.id, userEntityLinks.entity_id))
		.where(eq(userEntityLinks.user_id, user.value));

	return usersEntities.map((e) => e.id);
});

export const useAdminContracts = routeLoader$(async ({ resolveValue }) => {
	const entities = await resolveValue(useUserEntities);

	if (entities.length < 1) {
		return [];
	}

	const db = await drizzleDb;
	const adminContracts = await db
		.select()
		.from(contracts)
		.where(inArray(contracts.adminId, entities));

	return adminContracts;
});

export default component$(() => {
	const adminContracts = useAdminContracts();

	return (
		<div class="p-2">
			<Link href="/v2/create-contract">Create Contract</Link>
			{adminContracts.value.map((contract) => (
				<Link key={contract.id} href={`/v2/contract/${contract.id}`}>
					<pre class="w-fit p-2 outline">
						{JSON.stringify(contract, null, 2)}
					</pre>
				</Link>
			))}
		</div>
	);
});