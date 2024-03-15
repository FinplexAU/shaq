import { Slot, component$ } from "@builder.io/qwik";
import { WorkflowButton } from "./workflow";
import {
	contracts,
	workflows,
	workflowSteps,
	workflowStepTypes,
	documentTypes,
	documentVersions,
	workflowTypes,
	userEntityLinks,
	entities,
} from "@/drizzle/schema";
import { routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import { eq, and, asc, desc } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { selectFirst, throwIfNone } from "~/utils/drizzle-utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 } from "uuid";
import { s3 } from "~/utils/aws";
import { getSharedMap } from "~/routes/plugin";
import { alias } from "drizzle-orm/pg-core";

export type WorkflowStep = {
	stepId: string;
	stepName: string;
	stepNumber: number;
	complete: boolean;
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
	complete: boolean;
	completeReason: string | null;
	stepGroups: WorkflowStep[][];
};

export const useLoadContract = routeLoader$(
	async ({ redirect, params, sharedMap }) => {
		const user = getSharedMap(sharedMap, "user");

		if (!params.id) {
			throw redirect(302, "/v2/home");
		}

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

		const isPermitted = await db
			.select()
			.from(userEntityLinks)
			.where(
				and(
					eq(userEntityLinks.entity_id, contract.contracts.adminId),
					eq(userEntityLinks.user_id, user.id)
				)
			);

		if (isPermitted.length === 0) {
			throw redirect(302, "/v2/home");
		}

		return {
			...contract.contracts,
			admin: contract.admin,
			investor: contract.investor,
			trader: contract.trader,
		};
	}
);

export const useContractStep = routeLoader$(
	async ({ resolveValue, pathname }) => {
		let contract;
		contract = await resolveValue(useLoadContract);
		const db = await drizzleDb;
		if (!contract.jointVenture) {
			const jointVentureWorkflow = await createWorkflow("Joint Venture Set-up");
			contract = (
				await db
					.update(contracts)
					.set({ jointVenture: jointVentureWorkflow?.id })
					.where(eq(contracts.id, contract.id))
					.returning()
			)[0];
			return;
		}

		const workflow = pathname
			.split("/")
			.filter((v) => v)
			.at(-1);
		let workflowId;
		if (workflow === "joint-venture") {
			workflowId = contract.jointVenture;
		}

		if (!workflowId) {
			return;
		}

		const jointVentureWorkflowQuery = await db
			.select()
			.from(workflows)
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

		const jointVentureWorkflow: Workflow = {
			workflowId: jointVentureWorkflowQuery[0].workflows.id,
			workflowName: "Join Venture Set-up",
			complete: jointVentureWorkflowQuery[0].workflows.complete,
			completeReason: jointVentureWorkflowQuery[0].workflows.completionReason,
			stepGroups: [],
		};

		for (const sql of jointVentureWorkflowQuery) {
			let stepGroup: WorkflowStep[] | undefined =
				jointVentureWorkflow.stepGroups.find(
					(step) => step[0]?.stepNumber === sql.workflow_step_types.stepNumber
				);

			if (!stepGroup) {
				stepGroup = [];
				jointVentureWorkflow.stepGroups.push(stepGroup);
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
						investorApprovalRequired:
							sql.document_types.investorApprovalRequired,
						traderApprovalRequired: sql.document_types.traderApprovalRequired,
					};
					step.documents.push(document);
				}
				if (sql.document_versions) {
					document.versions.push(sql.document_versions);
				}
			}
		}

		return { jointVentureWorkflow };
	}
);

export const useUploadDocument = routeAction$(
	async (data, { error }) => {
		const db = await drizzleDb;
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
			);

		if (dbResult.length === 0) {
			return error(404, "Workflow step not found");
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

export const useContractCompletion = routeLoader$(async ({ resolveValue }) => {
	const contract = await resolveValue(useLoadContract);

	const db = await drizzleDb;

	const workflowCompletion: Record<"jointVenture", boolean> = {
		jointVenture: false,
	};

	if (!contract.jointVenture) {
		return workflowCompletion;
	} else {
		workflowCompletion.jointVenture = false;
	}

	const jointVenture = await db
		.select({
			complete: workflows.complete,
		})
		.from(workflows)
		.where(eq(workflows.id, contract.jointVenture))
		.then(selectFirst);

	if (jointVenture.complete) {
		workflowCompletion.jointVenture = true;
	}

	return workflowCompletion;
});

export default component$(() => {
	const contract = useLoadContract();
	const contractCompletion = useContractCompletion();
	return (
		<>
			<div class="grid h-14 place-items-center bg-blue-400/30">
				<h1 class="text-4xl font-bold">CONTRACT INFO</h1>
			</div>
			<div class="grid flex-1 grid-cols-12 ">
				<div class="col-span-2 border-r p-4">
					<WorkflowButton
						title="Contract Info"
						completion={true}
						route="/v2/contract/[id]/"
						param:id={contract.value.id}
					></WorkflowButton>
					<WorkflowButton
						title="Joint Venture Set-up"
						completion={contractCompletion.value.jointVenture}
						route="/v2/contract/[id]/joint-venture/"
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
				<div class="col-span-10">
					<Slot></Slot>
				</div>
			</div>
		</>
	);
});

const createWorkflow = async (workflowName: string) => {
	const db = await drizzleDb;

	const template = await db
		.select()
		.from(workflowTypes)
		.leftJoin(
			workflowStepTypes,
			eq(workflowTypes.id, workflowStepTypes.workflowTypeId)
		)
		.where(eq(workflowTypes.name, workflowName));

	const [workflow] = await db
		.insert(workflows)
		.values({ complete: false, workflowType: template[0]?.workflow_types.id })
		.returning({ id: workflows.id });

	const templatedSteps = template
		.filter(({ workflow_step_types }) => workflow_step_types)
		.map(({ workflow_step_types }) => ({
			complete: false,
			workflowId: workflow!.id,
			stepType: workflow_step_types!.id,
		}));
	await db.insert(workflowSteps).values(templatedSteps);

	return workflow;
};
