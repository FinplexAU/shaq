import { documentVersions, workflowSteps, workflows } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { drizzleDb } from "./db";
import { as } from "@upstash/redis/zmscore-5d82e632";

export const completeWorkflowStepIfNeeded = async (workflowStepId: string) => {
	const db = await drizzleDb;

	const step = await db.query.workflowSteps.findFirst({
		where: eq(workflowSteps.id, workflowStepId),
		with: {
			documentVersions: {
				orderBy: desc(documentVersions.version),
				with: { documentType: true },
			},
			stepType: {
				with: {
					documentTypes: {
						columns: { id: true, documentName: true },
					},
				},
			},
		},
	});

	if (!step) {
		return;
	}

	let stepRequiredDocs = step.stepType.documentTypes;
	const stepDocuments = step.documentVersions.reduce<
		Record<string, (typeof step.documentVersions)[number]>
	>((a, b) => {
		console.log(a[b.documentTypeId], b.version);
		if (b.version > (a[b.documentTypeId]?.version ?? -1)) {
			return { ...a, [b.documentTypeId]: b };
		} else {
			return a;
		}
	}, {});
	console.log("REQUIRED DOCS FOR STEP COMPLETION", stepRequiredDocs);

	for (const doc of Object.values(stepDocuments)) {
		if (
			doc.documentType.investorApprovalRequired &&
			doc.investorApproval === null
		) {
			console.info(
				"step not complete, investor approval required for: ",
				doc.documentType.documentName
			);
			return;
		}
		if (
			doc.documentType.traderApprovalRequired &&
			doc.traderApproval === null
		) {
			console.info(
				"step not complete, trader approval required for: ",
				doc.documentType.documentName
			);
			return;
		}
		stepRequiredDocs = stepRequiredDocs.filter(
			(requiredDoc) => requiredDoc.id !== doc.documentType.id
		);
	}

	if (stepRequiredDocs.length !== 0) {
		console.info(
			"step not complete, approval still required for: ",
			stepRequiredDocs.map((doc) => doc.documentName).join(", ")
		);
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
