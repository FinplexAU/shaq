import { Slot, component$ } from "@builder.io/qwik";
import { WorkflowButton } from "./workflow";
import {
	contracts,
	workflows,
	workflowSteps,
	workflowStepTypes,
	documentTypes,
	documentVersions,
	entities,
	workflowTypes,
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

export type WorkflowStep = {
	stepId: string;
	stepName: string;
	stepNumber: number;
	complete: Date | null;
	completeReason: string | null;
	documents: {
		typeId: string;
		name: string;
		investorApprovalRequired: boolean;
		traderApprovalRequired: boolean;
		versions: {
			id: string;
			investorApproval: Date | null;
			traderApproval: Date | null;
			version: number;
			createdAt: Date;
		}[];
	}[];
};

export type Workflow = {
	workflowId: string;
	workflowName: string;
	complete: Date | null;
	completeReason: string | null;
	stepGroups: WorkflowStep[][];
	isAdmin: boolean;
	isTrader: boolean;
	isInvestor: boolean;
};

export const useLoadContract = routeLoader$(
	async ({ redirect, params, sharedMap, error }) => {
		if (!params.id) {
			throw redirect(302, "/v2/home");
		}

		const user = getSharedMap(sharedMap, "user");

		const db = await drizzleDb;

		const admin = alias(entities, "admin");
		const investor = alias(entities, "investor");
		const trader = alias(entities, "trader");

		const contract = await db
			.select()
			.from(contracts)
			.innerJoin(admin, eq(admin.id, contracts.adminId))
			.leftJoin(investor, eq(investor.id, contracts.investorId))
			.leftJoin(trader, eq(trader.id, contracts.traderId))
			.where(eq(contracts.id, params.id))
			.then(selectFirst);

		const permissions = await getContractPermissions(params.id, user.id);

		if (!permissions.isPermitted) {
			throw error(404, "Not found");
		}

		return {
			...contract.contracts,
			admin: contract.admin,
			investor: contract.investor,
			trader: contract.trader,
			...permissions,
		};
	}
);

export const useWorkflow = routeLoader$(async ({ pathname, resolveValue }) => {
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
	}

	if (!workflowId) {
		return;
	}

	const workflowQuery = await db
		.select()
		.from(workflows)
		.innerJoin(workflowTypes, eq(workflows.workflowType, workflowTypes.id))
		.innerJoin(workflowSteps, eq(workflowSteps.workflowId, workflows.id))
		.innerJoin(
			workflowStepTypes,
			eq(workflowSteps.stepType, workflowStepTypes.id)
		)
		.leftJoin(
			documentTypes,
			eq(documentTypes.requiredBy, workflowSteps.stepType)
		)
		.leftJoin(
			documentVersions,
			and(
				eq(documentVersions.documentTypeId, documentTypes.id),
				eq(documentVersions.workflowStepId, workflowSteps.id)
			)
		)
		.where(eq(workflows.id, workflowId))
		.orderBy(
			asc(workflowStepTypes.stepNumber),
			asc(workflowStepTypes.name),
			desc(documentVersions.version)
		)
		.then(throwIfNone);

	const workflow: Workflow = {
		isAdmin: contract.isAdmin,
		isInvestor: contract.isInvestor,
		isTrader: contract.isTrader,
		workflowId: workflowQuery[0].workflows.id,
		workflowName: workflowQuery[0].workflow_types.name,
		complete: workflowQuery[0].workflows.complete,
		completeReason: workflowQuery[0].workflows.completionReason,
		stepGroups: [],
	};

	for (const sql of workflowQuery) {
		let stepGroup: WorkflowStep[] | undefined = workflow.stepGroups.find(
			(step) => step[0]?.stepNumber === sql.workflow_step_types.stepNumber
		);

		if (!stepGroup) {
			stepGroup = [];
			workflow.stepGroups.push(stepGroup);
		}

		let step: WorkflowStep | undefined = stepGroup.find(
			(step) => step.stepId === sql.workflow_steps.id
		);
		if (!step) {
			step = {
				stepId: sql.workflow_steps.id,
				stepName: sql.workflow_step_types.name,
				complete: sql.workflow_steps.complete,
				completeReason: sql.workflow_steps.completionReason,
				stepNumber: sql.workflow_step_types.stepNumber,
				documents: [],
			};
			stepGroup.push(step);
		}

		if (sql.document_types) {
			let document = step.documents.find(
				(a) => a.typeId === sql.document_types?.id
			);
			if (!document) {
				document = {
					versions: [],
					typeId: sql.document_types.id,
					name: sql.document_types.documentName,
					investorApprovalRequired: sql.document_types.investorApprovalRequired,
					traderApprovalRequired: sql.document_types.traderApprovalRequired,
				};
				step.documents.push(document);
			}
			if (sql.document_versions) {
				document.versions.push(sql.document_versions);
			}
		}
	}

	return workflow;
});

export const useUploadDocument = routeAction$(
	async (data, { error, sharedMap, params }) => {
		const user = getSharedMap(sharedMap, "user");
		const db = await drizzleDb;

		const contract = await getContractPermissions(params.id!, user.id);
		if (!contract.isPermitted) {
			return error(404, "Workflow step not found");
		}

		const dbResult = await db
			.select()
			.from(documentTypes)
			.innerJoin(
				workflowSteps,
				eq(documentTypes.requiredBy, workflowSteps.stepType)
			)
			.leftJoin(
				documentVersions,
				eq(documentVersions.documentTypeId, documentTypes.id)
			)
			.where(
				and(
					eq(documentTypes.id, data.documentTypeId),
					eq(workflowSteps.id, data.stepId)
				)
			)
			.then(throwIfNone);

		if (dbResult[0].workflow_steps.complete) {
			return error(400, "Step already complete");
		}

		let newVersion = 0;

		for (let i = 0; i < dbResult.length; i++) {
			const version = dbResult[i]?.document_versions;
			if (version) {
				newVersion = version.version + 1;
			}
		}
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
	async (data, { error, sharedMap, params }) => {
		const db = await drizzleDb;

		const user = getSharedMap(sharedMap, "user");

		const contract = await getContractPermissions(params.id!, user.id);

		if (!contract.isPermitted) {
			return error(404, "Not found");
		}
		if (!contract.isTrader && !contract.isInvestor) {
			return error(401, "Not authorized to approve a document");
		}

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
					eq(contracts.tradeSetup, workflowSteps.id)
				)
			)
			.where(eq(documentVersions.id, data.documentVersionId))
			.then(selectFirst);

		const traderApproval = doc.document_versions.traderApproval;
		const investorApproval = doc.document_versions.investorApproval;

		if (doc.workflow_steps.complete || (traderApproval && investorApproval)) {
			return error(400, "Cannot approve again");
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

	const workflowsQuery = await db
		.select({
			jointVenture: jointVenture.complete,
			tradeSetup: tradeSetup.complete,
		})
		.from(jointVenture)
		.innerJoin(tradeSetup, eq(tradeSetup.id, contract.tradeSetup!))
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
				<nav class="col-span-2 border-r p-4">
					<WorkflowButton
						title="Contract Info"
						completion={true}
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
				</nav>
				<main class="col-span-10 max-h-[calc(100vh-64px)] overflow-y-auto">
					<Slot></Slot>
				</main>
			</div>
		</>
	);
});
