import { entities, contracts } from "@/drizzle/schema";
import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, z } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import Table from "~/components/flowbite/components/Table/table";
import TableBody from "~/components/flowbite/components/Table/table-body";
import TableCell from "~/components/flowbite/components/Table/table-cell";
import TableRow from "~/components/flowbite/components/Table/table-row";
import { drizzleDb } from "~/db/db";
import { safeProm } from "~/utils/safeProm";

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

export const useContractLoader = routeLoader$(async (req) => {
	const parsedId = z.string().uuid().safeParse(req.params.id);
	if (!parsedId.success) {
		return { found: false } as const;
	}
	const id = parsedId.data;

	const x = await safeProm(getContractWithEntities(id));
	if (!x.success) {
		return { found: false } as const;
	}

	const contract = x.data[0];
	if (!contract?.contracts) {
		return { found: false } as const;
	}
	return { found: true, data: contract } as const;
});

export default component$(() => {
	const contract = useContractLoader();
	const signal = useSignal(false);

	return (
		<>
			{!contract.value.found && <ContractNotFound />}
			{contract.value.found && (
				<div>
					<button
						onClick$={() => {
							signal.value = !signal.value;
						}}
					>
						Test
					</button>
					Contract found
					<pre>{JSON.stringify(contract.value.data, null, 2)}</pre>
					<div class="w-[65ch]">
						<Table striped={signal.value} hoverable>
							<TableBody>
								<TableRow>
									<TableCell>Product</TableCell>
									<TableCell>{contract.value.data.contracts.product}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Volume</TableCell>
									<TableCell>{contract.value.data.contracts.volume}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Logistics</TableCell>
									<TableCell>
										{contract.value.data.contracts.logistics}
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</>
	);
});

export const ContractNotFound = component$(() => {
	return <div>Contract not found</div>;
});
