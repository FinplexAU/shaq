import { component$ } from "@builder.io/qwik";
import { Form, globalAction$, zod$, z } from "@builder.io/qwik-city";
import {
	Workflow,
	WorkflowTitle,
	WorkflowSteps,
	WorkflowStepGroup,
	WorkflowStep,
	useStepGroupAvailable,
} from "../workflow";
import { useWorkflow, useLoadContract } from "../layout";
import { Input } from "~/components/input";
import { Button } from "~/components/button";
import { drizzleDb } from "~/db/db";
import { contracts, entities, workflowSteps } from "@/drizzle/schema";
import { selectFirst } from "~/utils/drizzle-utils";
import { safe } from "~/utils/utils";
import { eq } from "drizzle-orm";
export default component$(() => {
	const contractSteps = useWorkflow();
	const contract = useLoadContract();
	const isAvailable = useStepGroupAvailable(contractSteps.value?.stepGroups);

	return (
		<Workflow>
			<WorkflowTitle>{contractSteps.value?.workflowName}</WorkflowTitle>
			<WorkflowSteps>
				{contractSteps.value?.stepGroups.map((stepGroup, i) => (
					<WorkflowStepGroup key={i} available={isAvailable(i)}>
						{stepGroup.map((step) => (
							<WorkflowStep key={step.stepId} step={step}>
								{step.stepName === "Investor Info" && (
									<>
										{step.complete ? (
											<>
												<div class="pb-4">
													<h4 class="text-lg font-bold">
														{contract.value.investor?.company}
													</h4>
													<p class="text-sm">
														{contract.value.investor?.address}
													</p>
													<p class="text-sm">
														{contract.value.investor?.companyRegistration}
													</p>
												</div>
												<AddEntityUsersForm></AddEntityUsersForm>
											</>
										) : (
											<EntityInfoForm
												entityField="investor"
												contractId={contract.value.id}
												stepId={step.stepId}
											></EntityInfoForm>
										)}
									</>
								)}
								{step.stepName === "Trader Info" && (
									<>
										{step.complete ? (
											<>
												<div class="pb-4">
													<h4 class="text-lg font-bold">
														{contract.value.trader?.company}
													</h4>
													<p class="text-sm">
														{contract.value.trader?.address}
													</p>
													<p class="text-sm">
														{contract.value.trader?.companyRegistration}
													</p>
												</div>
												<AddEntityUsersForm></AddEntityUsersForm>
											</>
										) : (
											<EntityInfoForm
												entityField="trader"
												contractId={contract.value.id}
												stepId={step.stepId}
											></EntityInfoForm>
										)}
									</>
								)}
							</WorkflowStep>
						))}
					</WorkflowStepGroup>
				))}
			</WorkflowSteps>
		</Workflow>
	);
});

export const useCreateEntity = globalAction$(
	async (data, { fail }) => {
		const db = await drizzleDb;

		const entity = await safe(
			db
				.insert(entities)
				.values({ ...data })
				.returning({
					id: entities.id,
				})
				.then(selectFirst)
		);

		if (entity.success) {
			const field: `${"investor" | "trader" | "supplier" | "admin" | "exitBuyer"}Id` = `${data.entityField}Id`;
			const contractUpdate = await safe(
				db.update(contracts).set({ [field]: entity.id })
			);

			if (contractUpdate.success) {
				if (data.stepId) {
					await safe(
						db
							.update(workflowSteps)
							.set({
								complete: true,
								completionReason: "Entity Information Received",
							})
							.where(eq(workflowSteps.id, data.stepId))
					);
				}
				return contractUpdate.success;
			} else {
				return fail(500, { message: "Something went wrong" });
			}
		}
	},
	zod$(
		z.object({
			company: z.string().min(1),
			address: z.string().min(1),
			companyRegistration: z.string().min(1),
			contractId: z.string().uuid(),
			stepId: z.string().uuid().optional().describe("Step to mark as complete"),
			entityField: z.enum([
				"investor",
				"trader",
				"supplier",
				"admin",
				"exitBuyer",
			]),
		})
	)
);

export const EntityInfoForm = component$(
	(props: {
		contractId: string;
		entityField: "investor" | "trader" | "supplier" | "admin" | "exitBuyer";
		stepId?: string;
	}) => {
		const createEntity = useCreateEntity();
		return (
			<Form action={createEntity} class="flex max-w-prose flex-col gap-y-4">
				<Input
					title="Company Name"
					placeholder="Company Name"
					name="company"
				></Input>
				<Input
					title="Address Information"
					placeholder="Address"
					name="address"
				></Input>
				<Input
					title="Company Registration"
					placeholder="Company Registration"
					name="companyRegistration"
				></Input>
				<Input type="hidden" name="contractId" value={props.contractId}></Input>
				<Input type="hidden" name="stepId" value={props.stepId}></Input>
				<Input
					type="hidden"
					name="entityField"
					value={props.entityField}
				></Input>
				<Button>Submit</Button>
			</Form>
		);
	}
);

export const useAddEntityUser = globalAction$(
	async () => {},
	zod$(
		z.object({
			email: z.string().email(),
		})
	)
);

export const AddEntityUsersForm = component$(() => {
	return (
		<Form class="flex max-w-prose flex-col gap-y-4">
			<Input
				title="Email"
				name="email"
				placeholder="business@email.com"
			></Input>
			<Button>Add</Button>
		</Form>
	);
});
