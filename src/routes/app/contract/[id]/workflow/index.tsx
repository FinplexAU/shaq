import {
	workflowStepDocuments,
	workflowSteps,
	workflows,
} from "@/drizzle/schema";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { component$ } from "@builder.io/qwik";
import {
	routeAction$,
	zod$,
	z,
	Form,
	routeLoader$,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { drizzleDb } from "~/db/db";
import { s3 } from "~/utils/aws";
import { safeProm } from "~/utils/safeProm";

export const useUploadDocumentVersion = routeAction$(
	async (x) => {
		const key = v4();
		const command = new PutObjectCommand({
			Bucket: "shaq-dev",
			Key: key,
			Body: Buffer.from(await x.document.arrayBuffer()),
			ContentType: x.document.type,
		});

		const putResult = await safeProm(s3.send(command));
		console.log(putResult);
		if (!putResult.success) {
			return { success: false } as const;
		}
	},
	zod$({
		document: z.any().refine((x): x is Blob => x instanceof Blob),
	})
);

export const useWorkflow = routeLoader$(async (req) => {
	const db = await drizzleDb;
	const id = req.params.id!;
	const workflow = await safeProm(
		db.select().from(workflows).where(eq(workflows.id, id))
	);

	console.log(workflow);
	if (workflow.success) {
		if (workflow.data.length > 0) {
			const steps = await safeProm(
				db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, id))
			);
			if (steps.success) {
				const outputSteps: any = [];
				for (const step of steps.data) {
					const stepDocuments = await safeProm(
						db
							.select()
							.from(workflowStepDocuments)
							.where(eq(workflowStepDocuments.workflowStepId, step.id))
					);

					if (stepDocuments.success) {
						outputSteps.push({ ...step, documents: stepDocuments.data });
					}
				}
				console.log(JSON.stringify(outputSteps, null, 2));
				return outputSteps;
			}
		}
	}
});

export default component$(() => {
	const action = useUploadDocumentVersion();

	return (
		<div>
			<p>Workflow</p>
			<p>Step 1</p>
			<p>Document 1</p>
			<p>Document 2</p>
			<p>Step 2</p>
			<p>Document 1</p>
			<p>Document 2</p>
		</div>
	);
});
