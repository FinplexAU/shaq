import { component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { drizzleDb } from "~/db/db";
import {
	contracts,
	documentTypes,
	documentVersions,
	userEntityLinks,
	workflowStepTypes,
	workflowSteps,
	workflowTypes,
	workflows,
} from "@/drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { selectFirst, throwIfNone } from "~/utils/drizzle-utils";
import Debugger from "~/components/debugger";

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

export type WorkflowStep = {
	stepId: string;
	stepName: string;
	stepNumber: number;
	complete: boolean;
	completeReason: string | null;
	documents: {
		typeId: string;
		name: string;
		investorApprovalRequired: boolean;
		traderApprovalRequired: boolean;
		versions: {
			id: string;
			investorApproval: Date | null;
			traderApproval: Date | null;
			version: number;
			createdAt: Date;
		}[];
	}[];
};

export type Workflow = {
	workflowId: string;
	workflowName: string;
	complete: boolean;
	completeReason: string | null;
	steps: WorkflowStep[];
};

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

	const jointVentureWorkflowQuery = await db
		.select()
		.from(workflows)
		.innerJoin(workflowSteps, eq(workflowSteps.workflowId, workflows.id))
		.innerJoin(
			workflowStepTypes,
			eq(workflowSteps.stepType, workflowStepTypes.id)
		)
		.leftJoin(
			documentTypes,
			eq(documentTypes.requiredBy, workflowSteps.stepType)
		)
		.leftJoin(
			documentVersions,
			and(
				eq(documentVersions.documentTypeId, documentTypes.id),
				eq(documentVersions.workflowStepId, workflowSteps.id)
			)
		)
		.where(eq(workflows.id, contract.jointVenture))
		.then(throwIfNone);
	// .orderBy(asc(workflowStepTypes.stepNumber), asc(documentVersions.version));

	const jointVentureWorkflow: Workflow = {
		workflowId: jointVentureWorkflowQuery[0].workflows.id,
		workflowName: "Join Venture Set-up",
		complete: jointVentureWorkflowQuery[0].workflows.complete,
		completeReason: jointVentureWorkflowQuery[0].workflows.completionReason,
		steps: [],
	};

	for (const sql of jointVentureWorkflowQuery) {
		let step: WorkflowStep | undefined = jointVentureWorkflow.steps.find(
			(step) => step.stepId === sql.workflow_steps.id
		);
		if (!step) {
			step = {
				stepId: sql.workflow_steps.id,
				stepName: sql.workflow_step_types.name,
				complete: sql.workflow_steps.complete,
				completeReason: sql.workflow_steps.completionReason,
				stepNumber: sql.workflow_step_types.stepNumber,
				documents: [],
			};
			jointVentureWorkflow.steps.push(step);
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

	return jointVentureWorkflow;
});

export default component$(() => {
	const contractSteps = useContractStep();

	return (
		<div>
			<Debugger value={contractSteps.value}></Debugger>
			{/* <WorkflowDisplay
				title="Joint Venture Set-up"
				workflowSteps={contractSteps.value[0]}
			></WorkflowDisplay> */}
		</div>
	);
});

// const WorkflowDisplay = component$(
// 	({ workflowSteps, title }: { workflowSteps: WorkflowStep[]; title: string }) => {
// 		return (
// 			<div>
// 				<h2>{title}</h2>
//                 <>{workflowSteps.}</>
// 			</div>
// 		);
// 	}
// );

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
		.values({ complete: false, workflowType: template[0]?.workflow_types.id })
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
