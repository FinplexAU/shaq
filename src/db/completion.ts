import { documentVersions, workflowSteps, workflows } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { drizzleDb } from "./db";

export const completeWorkflowStepIfNeeded = async (workflowStepId: string) => {
	const db = await drizzleDb;

	const step = await db.query.workflowSteps.findFirst({
		where: eq(workflowSteps.id, workflowStepId),
		with: {
			documentVersions: {
				orderBy: desc(documentVersions.version),
				limit: 1,
				with: { documentType: true },
			},
			stepType: {
				with: {
					documentTypes: {
						columns: { id: true },
					},
				},
			},
		},
	});

	if (!step) {
		return;
	}

	let stepRequiredDocs = step.stepType.documentTypes;

	for (const doc of step.documentVersions) {
		console.log(JSON.stringify(doc, null, 2));
		if (
			doc.documentType.investorApprovalRequired &&
			doc.investorApproval === null
		) {
			return;
		}
		if (
			doc.documentType.traderApprovalRequired &&
			doc.traderApproval === null
		) {
			return;
		}
		console.log(stepRequiredDocs);
		stepRequiredDocs = stepRequiredDocs.filter(
			(requiredDoc) => requiredDoc.id !== doc.documentType.id
		);
		console.log(stepRequiredDocs);
	}

	if (stepRequiredDocs.length !== 0) {
		return;
	}

	await db
		.update(workflowSteps)
		.set({
			complete: new Date(),
		})
		.where(eq(workflowSteps.id, workflowStepId));

	console.log("Completed");

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
