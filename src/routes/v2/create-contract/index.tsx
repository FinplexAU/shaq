import {
	contracts,
	entities,
	userEntityLinks,
	workflowStepTypes,
	workflowSteps,
	workflowTypes,
	workflows,
} from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";
import { getSharedMap } from "~/routes/plugin";
import { selectFirst } from "~/utils/drizzle-utils";

export const useCreateContract = routeAction$(
	async (data, { fail, redirect, sharedMap }) => {
		const user = getSharedMap(sharedMap, "user");

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
			.values({ userId: user.id, entityId: adminEntity.id });
		// now create contract

		const jointVentureWorkflow = await createWorkflow("Joint Venture Set-up");
		const tradeSetup = await createWorkflow("Trade Set-up");
		const contract = await db
			.insert(contracts)
			.values({
				adminId: adminEntity.id,
				jointVenture: jointVentureWorkflow.id,
				tradeSetup: tradeSetup.id,
			})
			.returning({ id: contracts.id })
			.then(selectFirst);

		throw redirect(302, `/v2/contract/${contract.id}/`);
	}
);

export default component$(() => {
	const createContract = useCreateContract();
	return (
		<Form action={createContract} class="flex flex-col items-center gap-2 p-8">
			<h2>Create Contract</h2>
			<Button>Create</Button>
		</Form>
	);
});

const createWorkflow = async (workflowName: string) => {
	const db = await drizzleDb;

	const template = await db
		.select()
		.from(workflowTypes)
		.leftJoin(
			workflowStepTypes,
			eq(workflowTypes.id, workflowStepTypes.workflowTypeId)
		)
		.where(eq(workflowTypes.name, workflowName));

	const workflow = await db
		.insert(workflows)
		.values({ workflowType: template[0]?.workflow_types.id })
		.returning({ id: workflows.id })
		.then(selectFirst);

	const templatedSteps = template
		.filter(({ workflow_step_types }) => workflow_step_types)
		.map(({ workflow_step_types }) => ({
			workflowId: workflow!.id,
			stepType: workflow_step_types!.id,
		}));
	if (templatedSteps.length > 0)
		await db.insert(workflowSteps).values(templatedSteps);

	return workflow;
};
