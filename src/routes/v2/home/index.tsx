import { drizzleDb } from "~/db/db";
import { AppLink } from "~/routes.config";
import { getSharedMap } from "~/routes/plugin";
import moment from "moment-timezone";
import { useUser } from "../layout";
import { isServer } from "@builder.io/qwik/build";
import {
	contracts,
	entities,
	userEntityLinks,
	users,
	workflowStepTypes,
	workflowSteps,
	workflowTypes,
	workflows,
} from "@/drizzle/schema";
import { component$, useComputed$ } from "@builder.io/qwik";
import {
	Form,
	routeAction$,
	routeLoader$,
	server$,
} from "@builder.io/qwik-city";
import { eq, type InferSelectModel } from "drizzle-orm";
import { selectFirst, throwIfNone } from "~/utils/drizzle-utils";
import { HiPlusCircleSolid } from "@qwikest/icons/heroicons";
import { Button } from "~/components/button";

export const useAllowedContracts = routeLoader$(async ({ sharedMap }) => {
	const user = getSharedMap(sharedMap, "user");
	const db = await drizzleDb;

	const getContracts = await db.query.users.findFirst({
		where: eq(users.id, user.id),
		columns: {},
		with: {
			userEntityLinks: {
				columns: {},
				with: {
					entity: {
						columns: {},
						with: {
							contract: true,
						},
					},
				},
			},
		},
	});

	return getContracts?.userEntityLinks.map((x) => x.entity.contract) ?? [];
});

const getServerHours = server$(function () {
	const timezone = this.request.headers.get("cf-timezone");
	if (!timezone) return new Date().getHours();
	else return moment().tz(timezone).hours();
});

export const useCreateContract = routeAction$(
	async (data, { fail, redirect, sharedMap }) => {
		const user = getSharedMap(sharedMap, "user");

		const db = await drizzleDb;
		// now create contract

		const jointVentureWorkflow = await createWorkflow("Joint Venture Set-up");
		const tradeSetup = await createWorkflow("Trade Set-up");
		const bankInstrumentSetup = await createWorkflow("Bank Instrument Set-up");
		const tradeBankInstrumentSetup = await createWorkflow(
			"Trade Bank Instrument Set-up"
		);
		const contract = await db
			.insert(contracts)
			.values({
				jointVenture: jointVentureWorkflow.id,
				tradeSetup: tradeSetup.id,
				bankInstrumentSetup: bankInstrumentSetup.id,
				tradeBankInstrumentSetup: tradeBankInstrumentSetup.id,
			})
			.returning({ id: contracts.id })
			.then(selectFirst);

		// first create the admin entity for the contract
		const [adminEntity] = await db
			.insert(entities)
			.values({ contractId: contract.id, role: "admin" })
			.returning({ id: entities.id });

		if (!adminEntity) {
			return fail(500, { message: "Something went wrong" });
		}
		// next link the user to the admin entity
		await db
			.insert(userEntityLinks)
			.values({ email: user.email, entityId: adminEntity.id });

		throw redirect(302, `/v2/contract/${contract.id}/`);
	}
);
const createWorkflow = async (workflowName: string) => {
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
		.values({ workflowType: template.id })
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

export default component$(() => {
	const contracts = useAllowedContracts();
	const user = useUser();
	const createContract = useCreateContract();
	const greeting = useComputed$(async () => {
		let curHr;

		if (isServer) curHr = await getServerHours();
		else curHr = new Date().getHours();

		if (curHr < 12) {
			return "Good Morning";
		} else if (curHr < 18) {
			return "Good Afternoon";
		} else {
			return "Good Evening";
		}
	});

	return (
		<div class="container p-4">
			<div class="mb-4 border-l-4 border-stone-800 px-2">
				<span>{greeting},</span>
				<h1 class="border-l-stone-300 text-4xl font-semibold">
					{user.value.name}
				</h1>
			</div>
			<h2 class="pb-4 text-2xl font-semibold">Your Contracts</h2>
			<ul class="flex flex-row gap-2 ">
				{contracts.value.map((contract) => (
					<li key={contract.id}>
						<Contract contract={contract}></Contract>
					</li>
				))}
				<li>
					<Form class="h-full" action={createContract}>
						<Button class="h-full" onClick$={() => {}}>
							<HiPlusCircleSolid class="text-xl"></HiPlusCircleSolid>
						</Button>
					</Form>
				</li>
			</ul>
		</div>
	);
});

export const Contract = component$(
	(props: { contract: InferSelectModel<typeof contracts> }) => {
		return (
			<AppLink route="/v2/contract/[id]/" param:id={props.contract.id}>
				<div class="rounded border bg-neutral-50 p-2 hover:bg-neutral-200">
					<p>{props.contract.id}</p>
					{/* <p>{props.contract.}</p> */}
				</div>
			</AppLink>
		);
	}
);
