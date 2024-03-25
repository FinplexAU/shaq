import { workflowSteps, workflowTypes, workflows } from "@/drizzle/schema";
import { drizzleDb } from "./db";
import { eq } from "drizzle-orm";
import { selectFirst } from "~/utils/drizzle-utils";

export const createWorkflow = async (
	workflowName: string,
	contractId: string
) => {
	const db = await drizzleDb;

	const template = await db.query.workflowTypes.findFirst({
		where: eq(workflowTypes.name, workflowName),
		with: {
			workflowStepTypes: true,
		},
	});

	if (!template) throw new Error("Workflow not found");

	const workflow = await db
		.insert(workflows)
		.values({ workflowType: template.id, contractId })
		.returning({ id: workflows.id })
		.then(selectFirst);

	const templatedSteps = template.workflowStepTypes.map((stepType) => ({
		workflowId: workflow.id,
		stepType: stepType.id,
	}));

	if (templatedSteps.length > 0)
		await db.insert(workflowSteps).values(templatedSteps);

	return workflow;
};
