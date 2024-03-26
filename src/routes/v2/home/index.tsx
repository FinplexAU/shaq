import { drizzleDb } from "~/db/db";
import { AppLink } from "~/routes.config";
import { getSharedMap } from "~/routes/plugin";
import moment from "moment-timezone";
import { useUser } from "../layout";
import { isServer } from "@builder.io/qwik/build";
import { contracts, entities, userEntityLinks, users } from "@/drizzle/schema";
import { component$, useComputed$ } from "@builder.io/qwik";
import {
	Form,
	routeAction$,
	routeLoader$,
	server$,
} from "@builder.io/qwik-city";
import { eq, type InferSelectModel } from "drizzle-orm";
import { selectFirst } from "~/utils/drizzle-utils";
import { HiPlusCircleSolid } from "@qwikest/icons/heroicons";
import { Button } from "~/components/button";
import { createWorkflow } from "~/db/workflows";

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

		const contract = await db
			.insert(contracts)
			.values({})
			.returning({ id: contracts.id })
			.then(selectFirst);

		await createWorkflow("Joint Venture Set-up", contract.id);
		await createWorkflow("Trade Set-up", contract.id);
		await createWorkflow("Bank Instrument Set-up", contract.id);
		await createWorkflow("Bank Instrument", contract.id);

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
		<div class="container bg-gradient-to-t p-4">
			<div class="mb-4 border-l-4 border-blue-400 px-2">
				<span>{greeting},</span>
				<h1 class="border-l-stone-300 text-4xl font-semibold">
					{user.value.name}
				</h1>
			</div>
			<h2 class="pb-4 text-2xl font-semibold">Your Contracts</h2>
			<ul class="flex max-w-prose flex-col flex-wrap gap-2">
				<li class="text-sm">Created At</li>
				{contracts.value.map((contract) => (
					<li key={contract.id}>
						<Contract contract={contract}></Contract>
					</li>
				))}
				<li>
					<Form class="h-full" action={createContract}>
						<Button
							class="grid h-full w-full place-items-center"
							onClick$={() => {}}
						>
							<HiPlusCircleSolid class=" text-xl"></HiPlusCircleSolid>
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
				<div class="rounded border bg-neutral-50 p-2 shadow hover:bg-neutral-200">
					<p>
						{props.contract.createdAt.toLocaleDateString([], {
							dateStyle: "full",
						})}
					</p>
					{/* <p>{props.contract.}</p> */}
				</div>
			</AppLink>
		);
	}
);
