import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { drizzleDb } from "~/db/db";
import {
	contracts,
	documentTypes,
	userEntityLinks,
	workflowSteps,
	workflowTypes,
	workflows,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { contains } from "@amcharts/amcharts5/.internal/core/util/Utils";

export const useLoadContract = routeLoader$(
	async ({ cookie, redirect, params }) => {
		const user = cookie.get("user");
		if (!user) {
			console.warn("no user cookie");
			throw redirect(302, "/v2");
		}

		if (!params.id) {
			throw redirect(302, "/v2/home");
		}

		const db = await drizzleDb;
		const [contract] = await db
			.select()
			.from(contracts)
			.where(eq(contracts.id, params.id))
			.limit(1);
		if (!contract) {
			throw redirect(302, "/v2/home");
		}

		const isPermitted = await db
			.select()
			.from(userEntityLinks)
			.where(
				and(
					eq(userEntityLinks.entity_id, contract.adminId),
					eq(userEntityLinks.user_id, user.value)
				)
			);

		if (isPermitted.length === 0) {
			throw redirect(302, "/v2/home");
		}

		return contract;
	}
);

export const useContractStep = routeLoader$(async ({ resolveValue }) => {
	const contract = await resolveValue(useLoadContract);

	return await createWorkflow("Joint Venture Set-up");
});

export default component$(() => {
	const contract = useContractStep();
	return (
		<div>
			<pre>{JSON.stringify(contract.value, null, 2)}</pre>
		</div>
	);
});

const createWorkflow = async (workflowName: string) => {
	const db = await drizzleDb;

	const foo = await db
		.select()
		.from(workflowTypes)
		.fullJoin(workflowSteps, eq(workflowTypes.id, workflowSteps.workflowId))
		.fullJoin(documentTypes, eq(documentTypes.requiredBy, workflowSteps.id))
		.where(eq(workflowTypes.name, workflowName));

	return foo;
};
