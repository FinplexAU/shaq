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
import { entities, userEntityLinks, users } from "@/drizzle/schema";
import { selectFirst } from "~/utils/drizzle-utils";
import { safe } from "~/utils/utils";
import { and, count, eq, inArray } from "drizzle-orm";
import { sendContractInvite } from "~/utils/email";
import { completeWorkflowStepIfNeeded } from "~/db/completion";

export const useEntityEmails = routeLoader$(async ({ resolveValue }) => {
	const contract = await resolveValue(useLoadContract);
	const db = await drizzleDb;

	const entityLookup = await db.query.entities.findMany({
		where: and(
			eq(entities.contractId, contract.id),
			inArray(entities.role, ["trader", "investor"])
		),
		with: {
			userEntityLinks: {
				columns: { email: true },
				with: {
					user: { columns: { id: true } },
				},
			},
		},
	});

	const result: {
		trader: { email: string; created: boolean }[];
		investor: { email: string; created: boolean }[];
	} = {
		trader: [],
		investor: [],
	};

	for (const entity of entityLookup) {
		if (entity.role === "trader") {
			for (const link of entity.userEntityLinks) {
				result.trader.push({
					email: link.email,
					created: Boolean(link.user),
				});
			}
		}
		if (entity.role === "investor") {
			for (const link of entity.userEntityLinks) {
				result.investor.push({
					email: link.email,
					created: Boolean(link.user),
				});
			}
		}
	}
	return result;
});

export default component$(() => {
	const workflow = useWorkflow();
	const contract = useLoadContract();
	const emails = useEntityEmails();
	const isAvailable = useStepGroupAvailable(workflow.value?.stepGroups);

	return (
		<Workflow>
			<WorkflowTitle>{workflow.value?.workflowType.name}</WorkflowTitle>
			<WorkflowSteps>
				{workflow.value?.stepGroups.map((stepGroup, i) => (
					<WorkflowStepGroup
						key={i}
						available={isAvailable(i)}
						completed={stepGroup.filter((step) => !step.complete).length === 0}
					>
						{stepGroup.map((step) => (
							<WorkflowStep key={step.id} step={step}>
								{step.stepType.name === "Investor Information" && (
									<>
										{contract.value.investor ? (
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
															<li class="list-inside" key={email.email}>
																{email.email}
																<span class="pl-2 text-sm font-light text-neutral-400">
																	{!email.created && <>(Pending)</>}
																</span>
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
												stepId={step.id}
											></EntityInfoForm>
										)}
									</>
								)}
								{step.stepType.name === "Trader Information" && (
									<>
										{contract.value.trader ? (
											<>
												<div class="pb-4">
													<h4 class="text-lg font-bold">
														{contract.value.trader.company}
													</h4>
													<p class="text-sm">{contract.value.trader.address}</p>
													<p class="text-sm">
														{contract.value.trader.companyRegistration}
													</p>
													<ul class="list-disc py-2 text-sm">
														{emails.value.trader.map((email) => (
															<li class="list-inside" key={email.email}>
																{email.email}
																<span class="pl-2 text-sm font-light text-neutral-400">
																	{!email.created && <>(Pending)</>}
																</span>
															</li>
														))}
													</ul>
												</div>
												<AddEntityUsersForm
													entityId={contract.value.trader.id}
												></AddEntityUsersForm>
											</>
										) : (
											<EntityInfoForm
												role="trader"
												contractId={contract.value.id}
												stepId={step.id}
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
				await completeWorkflowStepIfNeeded(data.stepId);
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
	async (data, { error, url, params, env }) => {
		const id = params.id!;
		const db = await drizzleDb;

		const entries = await db
			.select({ count: count(userEntityLinks.id) })
			.from(userEntityLinks)
			.where(
				and(
					eq(userEntityLinks.email, data.email),
					eq(userEntityLinks.entityId, data.entityId)
				)
			)
			.then(selectFirst);

		if (entries.count > 0) {
			return error(400, "User already added to entity");
		}

		await db.insert(userEntityLinks).values([data]);

		const existingUser = await db
			.select({ count: count(users.id) })
			.from(users)
			.where(eq(users.email, data.email))
			.then(selectFirst);

		await sendContractInvite(env, data.email, url, id, existingUser.count > 0);
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
				required
			></Input>
			<input hidden name="entityId" value={props.entityId} />
			<Button class="mt-4">Add</Button>
		</Form>
	);
});
