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
					lift: true,
				},
			},
		},
	});

	if (!contract) {
		throw ev.error(404, "Not found");
	}

	const lifts = contract.workflows
		.map((x) => x.lift)
		.filter((x): x is Exclude<typeof x, null> => Boolean(x));

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
		db
			.insert(lifts)
			.values([
				{
					workflowId: workflow.id,
					liftNumber: 0,
				},
			])
			.returning({ id: lifts.id })
	);

	if (!liftInsertResult.success) {
		throw ev.error(500, "Something went wrong when creating a lift");
	}
});

export default component$(() => {
	const loc = useLocation();
	const lifts = useLifts();
	const createLift = useCreateLift();

	return (
		<div class="max-w-prose p-8">
			<div class="flex flex-col gap-2">
				{lifts.value.map((x) => (
					<AppLink
						route="/v2/contract/[id]/lifts/[liftId]/"
						param:id={loc.params.id!}
						param:liftId={x.id}
						key={x.id}
					>
						<div class="rounded border bg-neutral-50 p-2 shadow hover:bg-neutral-200">
							<p>
								{x.createdAt.toLocaleDateString([], {
									dateStyle: "full",
								})}
							</p>
							{/* <p>{props.contract.}</p> */}
						</div>
					</AppLink>
				))}
				<Form action={createLift}>
					<Button type="submit">Create a new trade cycle</Button>
				</Form>
			</div>
		</div>
	);
});
