import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { drizzleDb } from "~/db/db";
import {
	contracts,
	documentTypes,
	documents,
	userEntityLinks,
	workflowStepDocuments,
	workflowStepTypes,
	workflowSteps,
	workflowTypes,
	workflows,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export const useLoadContract = routeLoader$(
	async ({ cookie, redirect, params }) => {
		const user = cookie.get("user");
		if (!user) {
			console.warn("no user cookie");
			throw redirect(302, "/v2");
		}

		if (!params.id) {
			throw redirect(302, "/v2/home");
		}

		const db = await drizzleDb;
		const [contract] = await db
			.select()
			.from(contracts)
			.where(eq(contracts.id, params.id))
			.limit(1);
		if (!contract) {
			throw redirect(302, "/v2/home");
		}

		const isPermitted = await db
			.select()
			.from(userEntityLinks)
			.where(
				and(
					eq(userEntityLinks.entity_id, contract.adminId),
					eq(userEntityLinks.user_id, user.value)
				)
			);

		if (isPermitted.length === 0) {
			throw redirect(302, "/v2/home");
		}

		return contract;
	}
);

export const useContractStep = routeLoader$(async ({ resolveValue }) => {
	let contract;
	contract = await resolveValue(useLoadContract);
	const db = await drizzleDb;
	if (!contract.jointVenture) {
		const jointVentureWorkflow = await createWorkflow("Joint Venture Set-up");
		contract = (
			await db
				.update(contracts)
				.set({ jointVenture: jointVentureWorkflow?.id })
				.where(eq(contracts.id, contract.id))
				.returning()
		)[0];
		return;
	}

	const jointVentureWorkflow = await db
		.select()
		.from(workflowSteps)
		.fullJoin(
			workflowStepDocuments,
			eq(workflowStepDocuments.workflowStepId, workflowSteps.id)
		)
		.fullJoin(documents, eq(workflowStepDocuments.documentId, documents.id))
		.fullJoin(
			documentTypes,
			eq(documentTypes.requiredBy, workflowSteps.stepType)
		)
		.fullJoin(
			workflowStepTypes,
			eq(workflowSteps.stepType, workflowStepTypes.id)
		)
		.where(eq(workflowSteps.workflowId, contract.jointVenture));

	return jointVentureWorkflow;
});

export default component$(() => {
	const contract = useContractStep();
	return (
		<div>
			<pre>{JSON.stringify(contract.value, null, 2)}</pre>
		</div>
	);
});

const createWorkflow = async (workflowName: string) => {
	const db = await drizzleDb;

	const template = await db
		.select()
		.from(workflowTypes)
		.fullJoin(
			workflowStepTypes,
			eq(workflowTypes.id, workflowStepTypes.workflow)
		)
		.where(eq(workflowTypes.name, workflowName));

	const [workflow] = await db
		.insert(workflows)
		.values({ complete: false })
		.returning({ id: workflows.id });

	const templatedSteps = template.map(({ workflow_step_types }) => ({
		complete: false,
		workflowId: workflow!.id,
		stepType: workflow_step_types?.id,
	}));
	await db.insert(workflowSteps).values(templatedSteps);

	return workflow;
};
