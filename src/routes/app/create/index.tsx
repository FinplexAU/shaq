import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { drizzleDb } from "~/db/db";
import { contracts, entities } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const useCreateAction = routeAction$(
	async (input) => {
		const db = await drizzleDb;
		const x = await db
			.insert(contracts)
			.values([input])
			.returning({ id: contracts.id });
		console.log(x);
		const y = await db.select().from(contracts);
		console.log(y);
	},
	zod$({
		product: z.string(),
		volume: z.string(),
		logistics: z.string(),
		deliveryPort: z.string(),
		loadingPort: z.string(),
		productPricing: z.string(),
	})
);

const getContractWithEntities = async (id: string) => {
	const traders = alias(entities, "traders");
	const exitBuyers = alias(entities, "exitBuyers");
	const investors = alias(entities, "investors");
	const suppliers = alias(entities, "suppliers");
	const db = await drizzleDb;
	const y = await db
		.select()
		.from(contracts)
		.leftJoin(exitBuyers, eq(contracts.exitBuyerId, exitBuyers.id))
		.leftJoin(traders, eq(contracts.traderId, traders.id))
		.leftJoin(investors, eq(contracts.investorId, investors.id))
		.leftJoin(suppliers, eq(contracts.supplierId, suppliers.id))
		.where(eq(contracts.id, id));
	return y;
};

export const useAddEntityToContact = routeAction$(
	async (input) => {
		console.log("hi");
		const db = await drizzleDb;

		const { id, ...set } = input;

		const x = await db
			.update(contracts)
			.set(set)
			.where(eq(contracts.id, id))
			.returning();
		console.log(x);
		console.log(await getContractWithEntities(id));
	},
	zod$({
		id: z.string().uuid(),
		traderId: z.string().min(1).uuid().optional().nullable(),
		investorId: z.string().min(1).uuid().optional().nullable(),
		supplierId: z.string().min(1).uuid().optional().nullable(),
		exitBuyerId: z.string().min(1).uuid().optional().nullable(),
	})
);

export default component$(() => {
	const createAction = useCreateAction();
	const addEntityAction = useAddEntityToContact();
	return (
		<>
			<Form action={createAction}>
				<div class="mx-auto flex max-w-prose flex-col">
					<input name="product" placeholder="Product"></input>
					<input name="volume" placeholder="Volume"></input>
					<input name="logistics" placeholder="Logistics"></input>
					<input name="deliveryPort" placeholder="DeliveryPort"></input>
					<input name="loadingPort" placeholder="LoadingPort"></input>
					<input name="productPricing" placeholder="ProductPricing"></input>
					<button type="submit">Submit</button>
				</div>
			</Form>
			<Form action={addEntityAction}>
				<div class="mx-auto flex max-w-prose flex-col">
					<input name="id" placeholder="Entity Id"></input>
					<input name="traderId" placeholder="Exit Buyer Id"></input>
					<button type="submit">Submit</button>
				</div>
			</Form>
		</>
	);
});
