import {
	documentVersions,
	documentTypes,
	workflowSteps,
	workflows,
	workflowStepTypes,
} from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { throwIfNone } from "~/utils/drizzle-utils";
import { drizzleDb } from "./db";

export const completeWorkflowStepIfNeeded = async (workflowStepId: string) => {
	const db = await drizzleDb;

	const docs = await db
		.select()
		.from(workflowSteps)
		.innerJoin(
			workflowStepTypes,
			eq(workflowStepTypes.id, workflowSteps.stepType)
		)
		.leftJoin(documentTypes, eq(documentTypes.requiredBy, workflowStepTypes.id))
		.leftJoin(
			documentVersions,
			and(
				eq(documentVersions.documentTypeId, documentTypes.id),
				eq(documentVersions.workflowStepId, workflowSteps.id)
			)
		)
		.where(eq(workflowSteps.id, workflowStepId))
		.orderBy(documentTypes.id, documentVersions.version)
		.then(throwIfNone);
	console.log(docs);

	for (const doc of docs) {
		// There is an expected document that is not uploaded
		const version = doc.document_versions;
		const type = doc.document_types;
		if (!version || !type) {
			return;
		}

		if (
			docs.some(
				(x) =>
					x.document_versions && x.document_versions.version > version.version
			)
		)
			continue;

		if (type.investorApprovalRequired && !version.investorApproval) {
			return;
		}
		if (type.traderApprovalRequired && !version.traderApproval) {
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
	console.log("Workflow Complete");

	await db
		.update(workflows)
		.set({
			complete: new Date(),
		})
		.where(eq(workflows.id, workflowId));
};
