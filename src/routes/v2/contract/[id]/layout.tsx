import { Slot, component$ } from "@builder.io/qwik";
import { WorkflowButton } from "./workflow";
import {
	contracts,
	workflows,
	documentTypes,
	documentVersions,
	workflowTypes,
} from "@/drizzle/schema";
import { routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import { eq, asc, desc, and } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 } from "uuid";
import { s3 } from "~/utils/aws";
import { getSharedMap } from "~/routes/plugin";
import { getContractPermissions } from "~/db/permissions";
import { completeWorkflowStepIfNeeded } from "~/db/completion";
import { selectFirst } from "~/utils/drizzle-utils";

export const useLoadContract = routeLoader$(
	async ({ redirect, params, sharedMap, error }) => {
		if (!params.id) {
			throw redirect(302, "/v2/home");
		}

		const user = getSharedMap(sharedMap, "user");

		const db = await drizzleDb;

		const contract = await db.query.contracts.findFirst({
			where: eq(contracts.id, params.id),
			with: {
				entities: true,
			},
		});

		if (!contract) {
			throw error(404, "Not found");
		}

		const admin = contract.entities.find((entity) => entity.role === "admin");
		const trader = contract.entities.find((entity) => entity.role === "trader");
		const investor = contract.entities.find(
			(entity) => entity.role === "investor"
		);

		const permissions = await getContractPermissions(params.id, user.email);

		if (!permissions.isPermitted) {
			throw error(404, "Not found");
		}

		return {
			...contract,
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
		const contract = await resolveValue(useLoadContract);

		const workflowParam = pathname
			.split("/")
			.filter((v) => v)
			.at(-1);

		let workflowName;
		if (workflowParam === "joint-venture") {
			workflowName = "Joint Venture Set-up";
		} else if (workflowParam === "contract-setup") {
			workflowName = "Trade Set-up";
		} else if (workflowParam === "bank-instrument-setup") {
			workflowName = "Bank Instrument Set-up";
		} else if (workflowParam === "bank-instrument") {
			workflowName = "Bank Instrument";
		}
		if (!workflowName) {
			return;
		}

		// This intermediatory lookup required unless the query below is rewritten with joins.
		// Because drizzle doesn't let you filter based on the child of a table. This change is in progress within drizzle.
		// https://github.com/drizzle-team/drizzle-orm/discussions/1152
		const workflowTypeId = await db.query.workflowTypes.findFirst({
			where: eq(workflowTypes.name, workflowName),
			columns: { id: true },
		});
		if (!workflowTypeId) {
			throw error(404, "Workflow not found.");
		}

		const queryResult = await db.query.workflows.findFirst({
			where: and(
				eq(workflows.workflowType, workflowTypeId.id),
				eq(workflows.contractId, contract.id)
			),
			with: {
				workflowType: true,
				workflowSteps: {
					with: {
						documentVersions: {
							with: {
								documentType: {
									with: {
										documentVersions: {
											orderBy: desc(documentVersions.version),
										},
									},
								},
							},
						},
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
		const { workflowSteps: steps, ...workflow } = queryResult;

		steps.sort((a, b) => {
			const sortIndex = a.stepType.stepNumber - b.stepType.stepNumber;
			if (sortIndex !== 0) {
				return sortIndex;
			}
			if (a.stepType.name === b.stepType.name) return 0;
			return a.stepType.name > b.stepType.name ? 1 : -1;
		});

		const stepGroups: (typeof steps)[] = [];
		for (const workflowStep of steps) {
			workflowStep.documentVersions.forEach((version) => {
				const docTypeId = version.documentTypeId;
				const docTypeIndex = workflowStep.stepType.documentTypes.findIndex(
					(docType) => docType.id === docTypeId
				);

				if (docTypeIndex === -1) {
					workflowStep.stepType.documentTypes.push(version.documentType);
				}
			});
			workflowStep.stepType.documentTypes =
				workflowStep.stepType.documentTypes.map((step) => ({
					...step,
					documentVersions: step.documentVersions.filter(
						(version) => version.workflowStepId === workflowStep.id
					),
				}));

			let stepGroup = stepGroups[workflowStep.stepType.stepNumber];
			if (!stepGroup) {
				stepGroup = [];
				stepGroups[workflowStep.stepType.stepNumber] = stepGroup;
			}
			stepGroup.push(workflowStep);
		}

		return {
			complete: workflow.complete,
			completionReason: workflow.completionReason,
			contractId: workflow.contractId,
			id: workflow.id,
			workflowType: workflow.workflowType,
			stepGroups: stepGroups,
		};
	}
);

export type Workflow = {
	id: string;
	contractId: string;
	workflowType: {
		id: string;
		name: string;
	};
	complete: Date | null;
	completionReason: string | null;
	stepGroups: WorkflowStep[][];
};
export type WorkflowStep = {
	id: string;
	complete: Date | null;
	completionReason: string | null;
	workflowId: string;
	stepType: WorkflowStepType;
};

export type WorkflowStepType = {
	id: string;
	name: string;
	stepNumber: number;
	workflowTypeId: string;
	documentTypes: WorkflowDocumentType[];
};

export type WorkflowDocumentType = {
	id: string;
	documentName: string;
	investorApprovalRequired: boolean;
	traderApprovalRequired: boolean;
	requiredBy: string | null;
	documentVersions: WorkflowDocumentVersion[];
};

export type WorkflowDocumentVersion = {
	id: string;
	investorApproval: Date | null;
	traderApproval: Date | null;
	documentTypeId: string;
	version: number;
	createdAt: Date;
	workflowStepId: string;
};

// export type Workflow = NonNullable<ReturnType<typeof useWorkflow>["value"]>;
// export type WorkflowStep = Workflow["stepGroups"][number][number];
// export type WorkflowStepType = WorkflowStep["stepType"];
// export type WorkflowDocumentType = WorkflowStepType["documentTypes"][number];
// export type WorkflowDocumentVersion =
// 	WorkflowDocumentType["documentVersions"][number];

export const useUploadDocument = routeAction$(
	async (data, { error, sharedMap, params }) => {
		const user = getSharedMap(sharedMap, "user");
		const db = await drizzleDb;
		console.log(data);
		let docTypeId: string;

		if (data.documentTypeId === undefined) {
			const docType = await db
				.insert(documentTypes)
				.values({
					documentName: data.documentName,
					investorApprovalRequired: data.investorApprovalRequired,
					traderApprovalRequired: data.traderApprovalRequired,
				})
				.returning({ id: documentTypes.id })
				.then(selectFirst);

			docTypeId = docType.id;
		} else {
			docTypeId = data.documentTypeId;
		}

		const contract = await getContractPermissions(params.id!, user.email);
		if (!contract.isPermitted) {
			return error(404, "Workflow step not found");
		}

		const previousDocumentLookup = await db.query.documentTypes.findFirst({
			where: eq(documentTypes.id, docTypeId),
			with: {
				documentVersions: {
					limit: 1,
					orderBy: desc(documentVersions.version),
					where: eq(documentVersions.workflowStepId, data.stepId),
				},
			},
		});

		// if (dbResult[0].workflow_steps.complete) {
		// 	return error(400, "Step already complete");
		// }

		const previousDocument = previousDocumentLookup?.documentVersions[0];
		const newVersion: number = previousDocument
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
				documentTypeId: docTypeId,
			},
		]);
	},
	zod$(
		z.union([
			z.object({
				document: z
					.any()
					.refine((arg): arg is Blob => arg instanceof Blob)
					.refine(
						(arg) => arg.size > 0,
						"Document must have a size greater than 0"
					),
				documentTypeId: z.string().uuid(),
				stepId: z.string().uuid(),
			}),
			z.object({
				document: z
					.any()
					.refine((arg): arg is Blob => arg instanceof Blob)
					.refine(
						(arg) => arg.size > 0,
						"Document must have a size greater than 0"
					),
				documentName: z.string(),
				documentTypeId: z.undefined(),
				investorApprovalRequired: z.coerce.boolean(),
				traderApprovalRequired: z.coerce.boolean(),
				stepId: z.string().uuid(),
			}),
		])
	)
);

export const useApproveDocument = routeAction$(
	async (data, { error, sharedMap, params, fail }) => {
		const db = await drizzleDb;

		const user = getSharedMap(sharedMap, "user");

		const contract = await getContractPermissions(params.id!, user.email);

		if (!contract.isPermitted) {
			return error(404, "Not found");
		}
		if (!contract.isTrader && !contract.isInvestor) {
			return fail(401, { message: "Not authorized to approve a document" });
		}

		const doc = await db.query.documentVersions.findFirst({
			where: eq(documentVersions.id, data.documentVersionId),
			with: {
				documentType: true,
				workflowStep: {
					with: {
						workflow: {
							with: {
								contract: true,
							},
						},
					},
				},
			},
		});

		if (!doc) {
			return error(404, "Not found");
		}

		if (doc.workflowStep.workflow.contract.id !== params.id) {
			return error(404, "Not found");
		}

		const traderApproval = doc.traderApproval;
		const investorApproval = doc.investorApproval;

		if (doc.workflowStep.complete || (traderApproval && investorApproval)) {
			return fail(400, { message: "Document cannot be approved again." });
		}

		const setTraderApproval =
			!traderApproval &&
			contract.isTrader &&
			doc.documentType.traderApprovalRequired;

		const setInvestorApproval =
			!investorApproval &&
			contract.isInvestor &&
			doc.documentType.investorApprovalRequired;

		const date = new Date();

		await db
			.update(documentVersions)
			.set({
				traderApproval: setTraderApproval ? date : undefined,
				investorApproval: setInvestorApproval ? date : undefined,
			})
			.where(eq(documentVersions.id, data.documentVersionId));

		await completeWorkflowStepIfNeeded(doc.workflowStep.id);
	},
	zod$({
		documentVersionId: z.string().uuid(),
	})
);

export const useContractCompletion = routeLoader$(async ({ resolveValue }) => {
	const contract = await resolveValue(useLoadContract);

	const db = await drizzleDb;

	const contractWorkflows = await db.query.contracts.findFirst({
		where: eq(contracts.id, contract.id),
		columns: {},
		with: {
			workflows: {
				columns: {
					complete: true,
				},
				with: {
					workflowType: {
						columns: {
							name: true,
						},
					},
				},
			},
		},
	});

	const output: Record<string, Date | null> = {};
	if (contractWorkflows) {
		for (const workflow of contractWorkflows.workflows) {
			output[workflow.workflowType.name] = workflow.complete;
		}
	}
	return output;
});

export default component$(() => {
	const contract = useLoadContract();
	const contractCompletion = useContractCompletion();
	return (
		<>
			<div class="relative grid flex-1 grid-cols-12">
				<div class="fixed left-0 top-0 h-screen w-screen bg-gradient-to-b from-blue-100/30 to-green-200/30"></div>
				<nav class="relative col-span-2 ">
					<div class="sticky top-16 p-4 pt-8">
						<WorkflowButton
							title="Contract Overview"
							completion={false}
							route="/v2/contract/[id]/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Joint Venture Set-up"
							completion={Boolean(
								contractCompletion.value["Joint Venture Set-up"]
							)}
							route="/v2/contract/[id]/joint-venture/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Trade Set-up"
							completion={Boolean(contractCompletion.value["Trade Set-up"])}
							route="/v2/contract/[id]/contract-setup/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Bank Instrument Set-up"
							completion={Boolean(
								contractCompletion.value["Bank Instrument Set-up"]
							)}
							route="/v2/contract/[id]/bank-instrument-setup/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Bank Instrument"
							completion={Boolean(contractCompletion.value["Bank Instrument"])}
							route="/v2/contract/[id]/bank-instrument/"
							param:id={contract.value.id}
						></WorkflowButton>
						<WorkflowButton
							title="Lifts"
							completion={false}
							route="/v2/contract/[id]/lifts/"
							param:id={contract.value.id}
						></WorkflowButton>
					</div>
				</nav>
				<main class="relative col-span-10 overflow-y-auto p-4 pt-8 ">
					<div class="h-full rounded-lg border bg-white shadow-lg">
						<Slot></Slot>
					</div>
				</main>
			</div>
		</>
	);
});
