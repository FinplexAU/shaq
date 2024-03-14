import { contracts, entities, userEntityLinks } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";

export const useCreateContract = routeAction$(
	async (data, { cookie, fail, redirect }) => {
		const user = cookie.get("user");

		if (!user) {
			return fail(400, {
				message: "Create a user ",
			});
		}
		const userId = user.value;
		const db = await drizzleDb;
		// first create the admin entity for the contract
		const [adminEntity] = await db
			.insert(entities)
			.values({})
			.returning({ id: entities.id });
		if (!adminEntity) {
			return fail(500, { message: "Something went wrong" });
		}
		// next link the user to the admin entity
		await db
			.insert(userEntityLinks)
			.values({ user_id: userId, entity_id: adminEntity.id });
		// now create contract

		const [contract] = await db
			.insert(contracts)
			.values({
				adminId: adminEntity.id,
				deliveryPort: data.deliveryPort,
				loadingPort: data.loadingPort,
				logistics: data.logistics,
				productPricing: data.productPricing.toString(),
				volume: data.volume.toString(),
				product: data.product,
			})
			.returning({ id: contracts.id });

		throw redirect(302, `/v2/contract/${contract?.id}/`);
	},
	zod$(
		z.object({
			product: z.string(),
			volume: z.coerce.number(),
			logistics: z.string(),
			deliveryPort: z.string(),
			loadingPort: z.string(),
			productPricing: z.coerce.number(),
		})
	)
);

export default component$(() => {
	const createContract = useCreateContract();
	return (
		<Form action={createContract} class="flex flex-col items-center gap-2 p-8">
			<h2>Create Contract</h2>
			<input type="text" name="product" placeholder="product"></input>
			<input type="number" name="volume" placeholder="volume"></input>
			<input type="text" name="logistics" placeholder="logistics"></input>
			<input type="text" name="deliveryPort" placeholder="deliveryPort"></input>
			<input type="text" name="loadingPort" placeholder="loadingPort"></input>
			<input
				type="number"
				name="productPricing"
				placeholder="productPricing"
			></input>
			<Button>Create</Button>
		</Form>
	);
});
