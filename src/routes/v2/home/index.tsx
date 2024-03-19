import { contracts, entities, userEntityLinks, users } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { getSharedMap } from "~/routes/plugin";

export const useAllowedContracts = routeLoader$(async ({ sharedMap }) => {
	const user = getSharedMap(sharedMap, "user");
	const db = await drizzleDb;

	const permissionLookup = await db
		.select()
		.from(contracts)
		.innerJoin(entities, eq(contracts.id, entities.contractId))
		.innerJoin(userEntityLinks, eq(userEntityLinks.entityId, entities.id))
		.innerJoin(users, eq(users.email, userEntityLinks.email))
		.where(eq(users.id, user.id));

	return permissionLookup.map((x) => x.contracts);
});

export default component$(() => {
	const adminContracts = useAllowedContracts();

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
