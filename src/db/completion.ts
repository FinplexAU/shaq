import {
	documentVersions,
	documentTypes,
	workflowSteps,
	workflows,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { throwIfNone } from "~/utils/drizzle-utils";
import { drizzleDb } from "./db";

export const completeWorkflowStepIfNeeded = async (workflowStepId: string) => {
	const db = await drizzleDb;

	const docs = await db
		.select()
		.from(documentVersions)
		.innerJoin(
			documentTypes,
			eq(documentTypes.id, documentVersions.documentTypeId)
		)
		.innerJoin(
			workflowSteps,
			eq(workflowSteps.id, documentVersions.workflowStepId)
		)
		.where(eq(workflowSteps.id, workflowStepId))
		.then(throwIfNone);

	for (const doc of docs) {
		if (
			doc.document_types.investorApprovalRequired &&
			!doc.document_versions.investorApproval
		) {
			return;
		}
		if (
			doc.document_types.traderApprovalRequired &&
			!doc.document_versions.traderApproval
		) {
			return;
		}
	}

	await db
		.update(workflowSteps)
		.set({
			complete: new Date(),
		})
		.where(eq(workflowSteps.id, workflowStepId));

	await completeWorkflowIfNeeded(docs[0].workflow_steps.workflowId);
};

export const completeWorkflowIfNeeded = async (workflowId: string) => {
	const db = await drizzleDb;

	const steps = await db
		.select()
		.from(workflowSteps)
		.innerJoin(workflows, eq(workflows.id, workflowSteps.workflowId))
		.where(eq(workflows.id, workflowId))
		.then(throwIfNone);

	for (const step of steps) {
		if (!step.workflow_steps.complete) {
			return;
		}
	}

	await db
		.update(workflows)
		.set({
			complete: new Date(),
		})
		.where(eq(workflows.id, workflowId));
};
