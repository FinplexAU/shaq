import { contracts, lifts } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";

export const useLift = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	const liftId = ev.params.liftId;
	if (!contractId || !liftId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const contract = await db.query.contracts.findFirst({
		where: eq(contracts.id, contractId),
		with: {
			workflows: {
				with: {
					lifts: {
						where: eq(lifts.id, liftId),
					},
				},
			},
		},
	});

	if (!contract) {
		throw ev.error(404, "Not found");
	}

	const lift = contract.workflows.flatMap((x) => x.lifts).at(0);

	if (!lift) {
		throw ev.error(404, "Not found");
	}

	return lift;
});

export default component$(() => {
	const lift = useLift();
	return (
		<div>
			<p>{lift.value.createdAt.toString()}</p>
			<p>{lift.value.volume}</p>
		</div>
	);
});
