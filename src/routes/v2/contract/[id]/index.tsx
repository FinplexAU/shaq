import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { drizzleDb } from "~/db/db";
import {
	contracts,
	documentTypes,
	documentVersions,
	documents,
	userEntityLinks,
	workflowStepDocuments,
	workflowStepTypes,
	workflowSteps,
	workflowTypes,
	workflows,
} from "@/drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

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
		.innerJoin(
			workflowStepTypes,
			eq(workflowSteps.stepType, workflowStepTypes.id)
		)
		.leftJoin(
			documentTypes,
			eq(documentTypes.requiredBy, workflowSteps.stepType)
		)
		.leftJoin(
			workflowStepDocuments,
			eq(workflowStepDocuments.workflowStepId, workflowSteps.id)
		)
		.leftJoin(
			documents,
			and(
				eq(workflowStepDocuments.documentId, documents.id),
				eq(documents.documentType, documentTypes.id)
			)
		)
		.leftJoin(documentVersions, eq(documentVersions.documentId, documents.id))
		.where(eq(workflowSteps.workflowId, contract.jointVenture))
		.orderBy(asc(workflowStepTypes.stepNumber), asc(documentVersions.version));

	const output: {
		workflowId: string;
		stepId: string;
		complete: boolean;
		completeReason: string | null;
		stepNumber: number;
		documents: {
			typeId: string;
			name: string;
			investorApprovalRequired: boolean;
			traderApprovalRequired: boolean;
			versions: {
				id: string;
				documentId: string;
				investorApproval: Date | null;
				traderApproval: Date | null;
				version: number;
				createdAt: Date;
			}[];
		}[];
	}[] = [];

	for (const sql of jointVentureWorkflow) {
		let step = output.find((x) => x.stepId === sql.workflow_steps.id);
		if (!step) {
			step = {
				workflowId: sql.workflow_steps.workflowId,
				stepId: sql.workflow_steps.id,
				complete: sql.workflow_steps.complete,
				completeReason: sql.workflow_steps.completionReason,
				stepNumber: sql.workflow_step_types.stepNumber,
				documents: [],
			};
			output.push(step);
		}

		if (sql.document_types) {
			let document = step.documents.find(
				(a) => a.typeId === sql.document_types?.id
			);
			if (!document) {
				document = {
					versions: [],
					typeId: sql.document_types.id,
					name: sql.document_types.documentName,
					investorApprovalRequired: sql.document_types.investorApprovalRequired,
					traderApprovalRequired: sql.document_types.traderApprovalRequired,
				};
				step.documents.push(document);
			}
			if (sql.document_versions) {
				document.versions.push(sql.document_versions);
			}
		}
	}

	return output;
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
		.leftJoin(
			workflowStepTypes,
			eq(workflowTypes.id, workflowStepTypes.workflowTypeId)
		)
		.where(eq(workflowTypes.name, workflowName));

	const [workflow] = await db
		.insert(workflows)
		.values({ complete: false })
		.returning({ id: workflows.id });

	const templatedSteps = template
		.filter(({ workflow_step_types }) => workflow_step_types)
		.map(({ workflow_step_types }) => ({
			complete: false,
			workflowId: workflow!.id,
			stepType: workflow_step_types!.id,
		}));
	await db.insert(workflowSteps).values(templatedSteps);

	return workflow;
};
