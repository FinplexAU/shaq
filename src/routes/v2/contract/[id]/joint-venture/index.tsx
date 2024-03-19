import { component$ } from "@builder.io/qwik";
import {
	Form,
	globalAction$,
	zod$,
	z,
	routeLoader$,
} from "@builder.io/qwik-city";
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
import { entities, userEntityLinks, workflowSteps } from "@/drizzle/schema";
import { selectFirst } from "~/utils/drizzle-utils";
import { safe } from "~/utils/utils";
import { and, eq, inArray } from "drizzle-orm";

export const useEntityEmails = routeLoader$(async ({ resolveValue }) => {
	const contract = await resolveValue(useLoadContract);
	const db = await drizzleDb;

	const emails = await db
		.select()
		.from(entities)
		.innerJoin(userEntityLinks, eq(userEntityLinks.entityId, entities.id))
		.where(
			and(
				eq(entities.contractId, contract.id),
				inArray(entities.role, ["trader", "investor"])
			)
		);

	const result: { trader: string[]; investor: string[] } = {
		trader: [],
		investor: [],
	};

	for (const row of emails) {
		if (row.entities.role === "trader") {
			result.trader.push(row.user_entity_links.email);
		}
		if (row.entities.role === "investor") {
			result.investor.push(row.user_entity_links.email);
		}
	}
	return result;
});

export default component$(() => {
	const contractSteps = useWorkflow();
	const contract = useLoadContract();
	const emails = useEntityEmails();
	const isAvailable = useStepGroupAvailable(contractSteps.value?.stepGroups);

	return (
		<Workflow>
			<WorkflowTitle>{contractSteps.value?.workflowName}</WorkflowTitle>
			<WorkflowSteps>
				{contractSteps.value?.stepGroups.map((stepGroup, i) => (
					<WorkflowStepGroup key={i} available={isAvailable(i)}>
						{stepGroup.map((step) => (
							<WorkflowStep key={step.stepId} step={step}>
								{step.stepName === "Investor Information" && (
									<>
										{step.complete && contract.value.investor ? (
											<>
												<div class="pb-4">
													<h4 class="text-lg font-bold">
														{contract.value.investor.company}
													</h4>
													<p class="text-sm">
														{contract.value.investor.address}
													</p>
													<p class="text-sm">
														{contract.value.investor.companyRegistration}
													</p>
													<ul class="list-disc py-2 text-sm">
														{emails.value.investor.map((email) => (
															<li class="list-inside" key={email}>
																{email}
															</li>
														))}
													</ul>
												</div>
												<AddEntityUsersForm
													entityId={contract.value.investor.id}
												></AddEntityUsersForm>
											</>
										) : (
											<EntityInfoForm
												role="investor"
												contractId={contract.value.id}
												stepId={step.stepId}
											></EntityInfoForm>
										)}
									</>
								)}
								{step.stepName === "Trader Information" && (
									<>
										{step.complete && contract.value.trader ? (
											<>
												<div class="pb-4">
													<h4 class="text-lg font-bold">
														{contract.value.trader.company}
													</h4>
													<p class="text-sm">{contract.value.trader.address}</p>
													<p class="text-sm">
														{contract.value.trader.companyRegistration}
													</p>
												</div>
												<div>
													{emails.value.trader.map((email) => (
														<p key={email}>{email}</p>
													))}
												</div>
												<AddEntityUsersForm
													entityId={contract.value.trader.id}
												></AddEntityUsersForm>
											</>
										) : (
											<EntityInfoForm
												role="trader"
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
	async (data) => {
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
			if (data.stepId) {
				await safe(
					db
						.update(workflowSteps)
						.set({
							complete: new Date(),
							completionReason: "Entity Information Received",
						})
						.where(eq(workflowSteps.id, data.stepId))
				);
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
			role: z.enum(["investor", "trader", "supplier", "admin", "exitBuyer"]),
		})
	)
);

export const EntityInfoForm = component$(
	(props: {
		contractId: string;
		role: "investor" | "trader" | "supplier" | "admin" | "exitBuyer";
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
				<Input type="hidden" name="role" value={props.role}></Input>
				<Button>Submit</Button>
			</Form>
		);
	}
);

export const useAddEntityUser = globalAction$(
	async (data, { error }) => {
		const db = await drizzleDb;
		const entries = await db
			.select()
			.from(userEntityLinks)
			.where(
				and(
					eq(userEntityLinks.email, data.email),
					eq(userEntityLinks.entityId, data.entityId)
				)
			);
		if (entries.find((x) => x.email === data.email)) {
			return error(400, "User already added to entity");
		}

		await db.insert(userEntityLinks).values([data]);
	},
	zod$(
		z.object({
			email: z.string().email(),
			entityId: z.string().uuid(),
		})
	)
);

export const AddEntityUsersForm = component$<{ entityId: string }>((props) => {
	const addEntityUser = useAddEntityUser();
	return (
		<Form class="flex max-w-prose flex-col" action={addEntityUser}>
			<Input
				title="Email"
				name="email"
				placeholder="business@email.com"
			></Input>
			<input hidden name="entityId" value={props.entityId} />
			<Button class="mt-4">Add</Button>
		</Form>
	);
});
