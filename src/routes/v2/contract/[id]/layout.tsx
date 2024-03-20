import { Slot, component$ } from "@builder.io/qwik";
import { WorkflowButton } from "./workflow";
import {
	contracts,
	workflows,
	workflowSteps,
	documentTypes,
	documentVersions,
	entities,
} from "@/drizzle/schema";
import { routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import { eq, and, asc, desc, or } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { selectFirst, throwIfNone } from "~/utils/drizzle-utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 } from "uuid";
import { s3 } from "~/utils/aws";
import { getSharedMap } from "~/routes/plugin";
import { alias } from "drizzle-orm/pg-core";
import { getContractPermissions } from "~/db/permissions";
import { completeWorkflowStepIfNeeded } from "~/db/completion";
import { safe } from "~/utils/utils";

export const useLoadContract = routeLoader$(
	async ({ redirect, params, sharedMap, error }) => {
		if (!params.id) {
			throw redirect(302, "/v2/home");
		}

		const user = getSharedMap(sharedMap, "user");

		const db = await drizzleDb;

		const contract = await db
			.select()
			.from(contracts)
			.leftJoin(entities, eq(contracts.id, entities.contractId))
			.where(eq(contracts.id, params.id))
			.then(throwIfNone);

		const admin = contract.find((x) => x.entities?.role === "admin")?.entities;
		const trader = contract.find(
			(x) => x.entities?.role === "trader"
		)?.entities;
		const investor = contract.find(
			(x) => x.entities?.role === "investor"
		)?.entities;

		const permissions = await getContractPermissions(params.id, user.id);

		if (!permissions.isPermitted) {
			throw error(404, "Not found");
		}

		return {
			...contract[0].contracts,
			admin,
			investor,
			trader,
			...permissions,
		};
	}
);

export const useWorkflow = routeLoader$(
	async ({ pathname, resolveValue, error }) => {
		const db = await drizzleDb;

		const workflowParam = pathname
			.split("/")
			.filter((v) => v)
			.at(-1);

		const contract = await resolveValue(useLoadContract);

		let workflowId;
		if (workflowParam === "joint-venture") {
			workflowId = contract.jointVenture;
		} else if (workflowParam === "contract-setup") {
			workflowId = contract.tradeSetup;
		} else if (workflowParam === "bank-instrument-setup") {
			workflowId = contract.bankInstrumentSetup;
		} else if (workflowParam === "trade-bank-instrument-setup") {
			workflowId = contract.tradeBankInstrumentSetup;
		}

		if (!workflowId) {
			return;
		}

		const queryResult = await db.query.workflows.findFirst({
			where: eq(workflows.id, workflowId),
			with: {
				workflowType: true,
				workflowSteps: {
					with: {
						stepType: {
							with: {
								documentTypes: {
									orderBy: asc(documentTypes.documentName),
									with: {
										documentVersions: {
											orderBy: desc(documentVersions.version),
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!queryResult) throw error(404, "Not Found");

		const { workflowSteps, ...workflow } = queryResult;

		workflowSteps.sort((a, b) => {
			const x = a.stepType.stepNumber - b.stepType.stepNumber;
			if (x !== 0) {
				return x;
			}
			if (a.stepType.name === b.stepType.name) return 0;
			return a.stepType.name > b.stepType.name ? 1 : -1;
		});

		const stepGroups: (typeof workflowSteps)[] = [];
		for (const workflowStep of workflowSteps) {
			let stepGroup = stepGroups[workflowStep.stepType.stepNumber];
			if (!stepGroup) {
				stepGroup = [];
				stepGroups[workflowStep.stepType.stepNumber] = stepGroup;
			}
			stepGroup.push(workflowStep);
		}

		return {
			...workflow,
			stepGroups: stepGroups,
		};
	}
);

export type Workflow = NonNullable<ReturnType<typeof useWorkflow>["value"]>;
export type WorkflowStep = Workflow["stepGroups"][number][number];
export type WorkflowStepType = WorkflowStep["stepType"];
export type WorkflowDocumentType = WorkflowStepType["documentTypes"][number];
export type WorkflowDocumentVersion =
	WorkflowDocumentType["documentVersions"][number];

export const useUploadDocument = routeAction$(
	async (data, { error, sharedMap, params }) => {
		const user = getSharedMap(sharedMap, "user");
		const db = await drizzleDb;

		const contract = await getContractPermissions(params.id!, user.id);
		if (!contract.isPermitted) {
			return error(404, "Workflow step not found");
		}

		const previousDocument = await safe(
			db
				.select({ version: documentVersions.version })
				.from(documentVersions)
				.innerJoin(
					documentTypes,
					eq(documentTypes.id, documentVersions.documentTypeId)
				)
				.orderBy(desc(documentVersions.version))
				.limit(1)
				.where(
					and(
						eq(documentVersions.workflowStepId, data.stepId),
						eq(documentTypes.id, data.documentTypeId)
					)
				)
				.then(selectFirst)
		);

		// if (dbResult[0].workflow_steps.complete) {
		// 	return error(400, "Step already complete");
		// }

		const newVersion: number = previousDocument.success
			? previousDocument.version + 1
			: 0;

		const contentType = data.document.type;

		const key = v4();
		const command = new PutObjectCommand({
			Bucket: "shaq-dev",
			Key: key,
			Body: Buffer.from(await data.document.arrayBuffer()),
			ContentType: contentType,
		});

		await s3.send(command);

		await db.insert(documentVersions).values([
			{
				id: key,
				version: newVersion,
				workflowStepId: data.stepId,
				documentTypeId: data.documentTypeId,
			},
		]);
	},
	zod$({
		document: z
			.any()
			.refine((arg): arg is Blob => arg instanceof Blob)
			.refine(
				(arg) => arg.size > 0,
				"Document must have a size greater than 0"
			),
		documentTypeId: z.string().uuid(),
		stepId: z.string().uuid(),
	})
);

export const useApproveDocument = routeAction$(
	async (data, { error, sharedMap, params, fail }) => {
		const db = await drizzleDb;

		const user = getSharedMap(sharedMap, "user");

		const contract = await getContractPermissions(params.id!, user.id);

		if (!contract.isPermitted) {
			return error(404, "Not found");
		}
		if (!contract.isTrader && !contract.isInvestor) {
			return fail(401, { message: "Not authorized to approve a document" });
		}

		console.log("Hi", data.documentVersionId);

		const doc = await db
			.select()
			.from(documentVersions)
			.innerJoin(
				documentTypes,
				eq(documentTypes.id, documentVersions.documentTypeId)
			)
			.innerJoin(
				workflowSteps,
				eq(workflowSteps.id, documentVersions.workflowStepId)
			)
			.innerJoin(
				contracts,
				or(
					eq(contracts.jointVenture, workflowSteps.workflowId),
					eq(contracts.tradeSetup, workflowSteps.workflowId),
					eq(contracts.bankInstrumentSetup, workflowSteps.workflowId),
					eq(contracts.tradeBankInstrumentSetup, workflowSteps.workflowId)
				)
			)
			.where(eq(documentVersions.id, data.documentVersionId))
			.then(selectFirst);

		const traderApproval = doc.document_versions.traderApproval;
		const investorApproval = doc.document_versions.investorApproval;

		console.log(doc.workflow_steps.complete, traderApproval, investorApproval);
		if (doc.workflow_steps.complete || (traderApproval && investorApproval)) {
			return fail(400, { message: "Document cannot be approved again." });
		}

		const setTraderApproval =
			!traderApproval &&
			contract.isTrader &&
			doc.document_types.traderApprovalRequired;

		const setInvestorApproval =
			!investorApproval &&
			contract.isInvestor &&
			doc.document_types.investorApprovalRequired;

		const date = new Date();

		await db
			.update(documentVersions)
			.set({
				traderApproval: setTraderApproval ? date : undefined,
				investorApproval: setInvestorApproval ? date : undefined,
			})
			.where(eq(documentVersions.id, data.documentVersionId));

		await completeWorkflowStepIfNeeded(doc.workflow_steps.id);
	},
	zod$({
		documentVersionId: z.string().uuid(),
	})
);

export const useContractCompletion = routeLoader$(async ({ resolveValue }) => {
	const contract = await resolveValue(useLoadContract);

	const db = await drizzleDb;

	const jointVenture = alias(workflows, "jointVenture");
	const tradeSetup = alias(workflows, "tradeSetup");
	const bankInstrumentSetup = alias(workflows, "bankInstrumentSetup");
	const tradeBankInstrumentSetup = alias(workflows, "tradeBankInstrumentSetup");

	const workflowsQuery = await db
		.select({
			jointVenture: jointVenture.complete,
			tradeSetup: tradeSetup.complete,
			bankInstrumentSetup: bankInstrumentSetup.complete,
			tradeBankInstrumentSetup: tradeBankInstrumentSetup.complete,
		})
		.from(jointVenture)
		.innerJoin(tradeSetup, eq(tradeSetup.id, contract.tradeSetup!))
		.innerJoin(
			bankInstrumentSetup,
			eq(bankInstrumentSetup.id, contract.bankInstrumentSetup!)
		)
		.innerJoin(
			tradeBankInstrumentSetup,
			eq(tradeBankInstrumentSetup.id, contract.bankInstrumentSetup!)
		)
		.where(eq(jointVenture.id, contract.jointVenture!))
		.then(selectFirst);

	return workflowsQuery;
});

export default component$(() => {
	const contract = useLoadContract();
	const contractCompletion = useContractCompletion();
	return (
		<>
			<div class="grid flex-1 grid-cols-12">
				<nav class="relative col-span-2 border-r ">
					<div class="sticky top-16 p-4">
						<WorkflowButton
							title="Contract Info"
							completion={false}
							route="/v2/contract/[id]/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Joint Venture Set-up"
							completion={Boolean(contractCompletion.value.jointVenture)}
							route="/v2/contract/[id]/joint-venture/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Trade Set-up"
							completion={Boolean(contractCompletion.value.tradeSetup)}
							route="/v2/contract/[id]/contract-setup/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Bank Instrument Set-up"
							completion={Boolean(contractCompletion.value.bankInstrumentSetup)}
							route="/v2/contract/[id]/bank-instrument-setup/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Trade Instrument Set-up"
							completion={Boolean(
								contractCompletion.value.tradeBankInstrumentSetup
							)}
							route="/v2/contract/[id]/trade-bank-instrument-setup/"
							param:id={contract.value.id}
						></WorkflowButton>
						{/* <WorkflowButton
						title="Trade Set-up"
						completion={"disabled"}
					></WorkflowButton>
					<WorkflowButton
						title="Bank Instrument Set-up"
						completion={"disabled"}
					></WorkflowButton>
					<WorkflowButton
						title="Bank Instrument Workflow"
						completion={"disabled"}
					></WorkflowButton>
					<WorkflowButton
						title="Hedge Process"
						completion={"disabled"}
					></WorkflowButton>
					<WorkflowButton
						title="Trade Process"
						completion={"disabled"}
					></WorkflowButton> */}
					</div>
				</nav>
				<main class="col-span-10 overflow-y-auto">
					<Slot></Slot>
				</main>
			</div>
		</>
	);
});
