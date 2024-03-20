import { component$ } from "@builder.io/qwik";
import { zod$, z, routeAction$, Form } from "@builder.io/qwik-city";
import { useContractCompletion, useLoadContract, useWorkflow } from "../layout";
import {
	Workflow,
	WorkflowStep,
	WorkflowStepGroup,
	WorkflowSteps,
	WorkflowTitle,
	useStepGroupAvailable,
} from "../workflow";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { drizzleDb } from "~/db/db";
import { contracts, workflowSteps } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Debugger from "~/components/debugger";

export const useSubmitTradeInfo = routeAction$(
	async (data) => {
		const db = await drizzleDb;

		await db
			.update(contracts)
			.set({
				deliveryPort: data.deliveryPort,
				loadingPort: data.loadingPort,
				logistics: data.logistics,
				productPricing: data.productPricing.toString(),
				volume: data.volume.toString(),
				product: data.product,
			})
			.where(eq(contracts.id, data.contractId));

		await db
			.update(workflowSteps)
			.set({
				complete: new Date(),
				completionReason: "Received trade information",
			})
			.where(eq(workflowSteps.id, data.stepId));
	},
	zod$(
		z.object({
			product: z.string(),
			volume: z.coerce.number(),
			logistics: z.string(),
			deliveryPort: z.string(),
			loadingPort: z.string(),
			productPricing: z.coerce.number(),
			contractId: z.string().uuid(),
			stepId: z.string().uuid(),
		})
	)
);

export default component$(() => {
	const contract = useLoadContract();
	const workflow = useWorkflow();
	const contractCompletion = useContractCompletion();
	const submitTradeInfo = useSubmitTradeInfo();

	const isAvailable = useStepGroupAvailable(
		workflow.value?.stepGroups,
		contractCompletion.value.jointVenture
	);

	return (
		<Workflow>
			<WorkflowTitle>{workflow.value?.workflowType.name}</WorkflowTitle>
			<WorkflowSteps>
				{workflow.value?.stepGroups.map((stepGroup, i) => (
					<WorkflowStepGroup key={i} available={isAvailable(i)}>
						{stepGroup.map((step) => (
							<WorkflowStep key={step.id} step={step}>
								{i === 0 && step.complete && (
									<Debugger
										value={{
											deliveryPort: contract.value.deliveryPort,
											loadingPort: contract.value.loadingPort,
											logistics: contract.value.logistics,
											productPricing: contract.value.productPricing?.toString(),
											volume: contract.value.volume?.toString(),
											product: contract.value.product,
										}}
									></Debugger>
								)}
								{i === 0 && !step.complete && (
									<Form
										aria-disabled={!contractCompletion.value.jointVenture}
										action={submitTradeInfo}
										class="flex max-w-prose flex-col gap-4"
									>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="hidden"
											value={contract.value.id}
											name="contractId"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="hidden"
											value={step.id}
											name="stepId"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="text"
											name="product"
											placeholder="Product"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="number"
											name="volume"
											placeholder="Volume"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="text"
											name="logistics"
											placeholder="Logistics"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="text"
											name="deliveryPort"
											placeholder="Delivery Port"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="text"
											name="loadingPort"
											placeholder="Loading Port"
										></Input>
										<Input
											disabled={!contractCompletion.value.jointVenture}
											type="number"
											name="productPricing"
											placeholder="Product Pricing"
										></Input>
										<Button disabled={!contractCompletion.value.jointVenture}>
											Submit
										</Button>
									</Form>
								)}
							</WorkflowStep>
						))}
					</WorkflowStepGroup>
				))}
			</WorkflowSteps>
		</Workflow>
	);
});
