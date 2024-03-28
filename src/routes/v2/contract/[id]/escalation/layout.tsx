import { contracts } from "@/drizzle/schema";
import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";

export const useEscalations = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	if (!contractId) {
		throw ev.error(404, "Not found");
	}
	const db = await drizzleDb;

	const contract = await db.query.contracts.findFirst({
		where: eq(contracts.id, contractId),
		with: {
			escalations: true,
		},
	});

	if (!contract) {
		throw ev.error(404, "Not found");
	}

	return contract.escalations;
});

export default component$(() => {
	return <Slot />;
});
