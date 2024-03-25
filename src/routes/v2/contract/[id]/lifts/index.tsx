import { contracts, lifts } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import {
	Form,
	routeAction$,
	routeLoader$,
	useLocation,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";
import { createWorkflow } from "~/db/workflows";
import { AppLink } from "~/routes.config";
import { safe } from "~/utils/utils";

export const useLifts = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	if (!contractId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const contract = await db.query.contracts.findFirst({
		where: eq(contracts.id, contractId),
		with: {
			workflows: {
				with: {
					lifts: true,
				},
			},
		},
	});

	if (!contract) {
		throw ev.error(404, "Not found");
	}

	const lifts = contract.workflows.flatMap((x) => x.lifts);

	console.log(lifts);

	return lifts;
});

export const useCreateLift = routeAction$(async (data, ev) => {
	const contractId = ev.params.id;

	if (!contractId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const workflow = await createWorkflow("Create Lift", contractId);
	const liftInsertResult = await safe(
		db.insert(lifts).values([
			{
				workflowId: workflow.id,
				liftNumber: 0,
				volume: "1.5",
			},
		])
	);

	if (!liftInsertResult) {
		throw ev.error(500, "Something went wrong when creating a lift");
	}
});

export default component$(() => {
	const loc = useLocation();
	const lifts = useLifts();
	const createLift = useCreateLift();

	return (
		<>
			{lifts.value.map((x) => (
				<AppLink
					route="/v2/contract/[id]/lifts/[liftId]/"
					param:id={loc.params.id!}
					param:liftId={x.id}
					key={x.id}
				>
					<p>
						{x.id} - {x.createdAt.toString()}
					</p>
				</AppLink>
			))}
			<Form action={createLift}>
				<Button type="submit">Create a new lift</Button>
			</Form>
		</>
	);
});
