import {
	documentTypes,
	workflowStepTypes,
	workflowTypes,
} from "@/drizzle/schema";
import { component$, useStore } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { type InferSelectModel } from "drizzle-orm";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { drizzleDb } from "~/db/db";
import { selectFirst } from "~/utils/drizzle-utils";

export const useGenerateWorkflow = routeAction$(
	async (data) => {
		const db = await drizzleDb;

		const workflowType = await db
			.insert(workflowTypes)
			.values({ name: data.workflowName })
			.returning({ id: workflowTypes.id })
			.then(selectFirst);

		const stepTypes = await db
			.insert(workflowStepTypes)
			.values(
				data.workflowSteps.map((step) => ({
					name: step.stepName,
					stepNumber: step.stepNumber,
					workflowTypeId: workflowType.id,
				}))
			)
			.returning({
				id: workflowStepTypes.id,
			});

		const documents: InferSelectModel<typeof documentTypes> = data.workflowSteps
			.flatMap((foo, i) =>
				foo.documents?.flatMap((bar) => ({
					documentName: bar.name,
					investorApprovalRequired: bar.requiredByInvestor,
					traderApprovalRequired: bar.requiredByTrader,
					requiredBy: stepTypes[i]?.id,
				}))
			)
			.filter((doc) => doc !== undefined);

		await db.insert(documentTypes).values(documents);
	},
	zod$(
		z.object({
			workflowName: z.string(),
			workflowSteps: z
				.object({
					stepName: z.string(),
					stepNumber: z.coerce.number(),
					documents: z
						.object({
							name: z.string(),
							requiredByInvestor: z.coerce.boolean(),
							requiredByTrader: z.coerce.boolean(),
						})
						.array()
						.optional(),
				})
				.array(),
		})
	)
);

export default component$(() => {
	const generateWorkflow = useGenerateWorkflow();
	const steps = useStore<number[]>([]);

	return (
		<Form action={generateWorkflow} class="flex max-w-prose flex-col gap-4 p-4">
			<Input
				name="workflowName"
				title="Workflow Name"
				placeholder="Workflow Name"
			></Input>
			{steps.map((documentCount, i) => (
				<div key={i} class="flex flex-col gap-2 pl-8">
					<Input
						title="Step Name"
						name={`workflowSteps.${i}.stepName`}
						placeholder="Step Name"
					></Input>
					<Input
						title="Step Number"
						value={i}
						type="number"
						name={`workflowSteps.${i}.stepNumber`}
						placeholder="Step Number"
					></Input>
					{new Array(documentCount).fill(undefined).map((_, j) => (
						<div class="flex w-full gap-2 pl-4 first:flex-1" key={j}>
							<Input
								title="Document Name"
								name={`workflowSteps.${i}.documents.${j}.name`}
								placeholder="document name"
							></Input>
							<Input
								title="Investor Approval"
								name={`workflowSteps.${i}.documents.${j}.requiredByInvestor`}
								placeholder="document name"
								type="checkbox"
							></Input>
							<Input
								title="Trader Approval"
								name={`workflowSteps.${i}.documents.${j}.requiredByTrader`}
								placeholder="document name"
								type="checkbox"
							></Input>
						</div>
					))}
					<Button
						type="button"
						onClick$={() => {
							steps[i]++;
						}}
					>
						Add Document
					</Button>
				</div>
			))}
			<Button
				type="button"
				onClick$={() => {
					steps.push(0);
				}}
			>
				Add Step
			</Button>

			<Button>Submit</Button>
		</Form>
	);
});
