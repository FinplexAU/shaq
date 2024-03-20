import { documentVersions, workflowSteps, workflows } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { drizzleDb } from "./db";

export const completeWorkflowStepIfNeeded = async (workflowStepId: string) => {
	const db = await drizzleDb;

	const step = await db.query.workflowSteps.findFirst({
		where: eq(workflowSteps.id, workflowStepId),
		with: {
			stepType: {
				with: {
					documentTypes: {
						with: {
							documentVersions: {
								orderBy: desc(documentVersions.version),
								limit: 1,
							},
						},
					},
				},
			},
		},
	});

	if (!step) {
		return;
	}

	for (const doc of step.stepType.documentTypes) {
		const version = doc.documentVersions[0];
		if (!version) {
			// There is an expected document that is not uploaded
			return;
		}

		if (doc.investorApprovalRequired && !version.investorApproval) {
			return;
		}
		if (doc.traderApprovalRequired && !version.traderApproval) {
			return;
		}
	}

	await db
		.update(workflowSteps)
		.set({
			complete: new Date(),
		})
		.where(eq(workflowSteps.id, workflowStepId));

	console.log("Complete");

	await completeWorkflowIfNeeded(step.workflowId);
};

export const completeWorkflowIfNeeded = async (workflowId: string) => {
	const db = await drizzleDb;

	const workflow = await db.query.workflows.findFirst({
		where: eq(workflows.id, workflowId),
		with: {
			workflowSteps: {
				columns: {
					complete: true,
				},
			},
		},
	});

	if (!workflow) return;

	for (const step of workflow.workflowSteps) {
		if (!step.complete) {
			return;
		}
	}

	console.log("Workflow Complete");

	await db
		.update(workflows)
		.set({
			complete: new Date(),
		})
		.where(eq(workflows.id, workflowId));
};
