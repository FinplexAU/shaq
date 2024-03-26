import { contracts, documentTypes, documentVersions } from "@/drizzle/schema";
import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { asc, desc, eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import {
	Workflow,
	WorkflowStep,
	WorkflowStepGroup,
	WorkflowSteps,
	WorkflowTitle,
	useStepGroupAvailable,
} from "../../workflow";
import Debugger from "~/components/debugger";

export const useLiftWorkflow = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	const liftId = ev.params.liftId;
	if (!contractId || !liftId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const contract = await db.query.contracts.findFirst({
		where: eq(contracts.id, contractId),
		with: {
			workflows: {
				with: {
					lift: true,
					workflowType: true,
					workflowSteps: {
						with: {
							documentVersions: {
								with: {
									documentType: {
										with: {
											// documentVersions: {
											// 	orderBy: desc(documentVersions.version),
											// },
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
			},
		},
	});

	if (!contract) {
		throw ev.error(404, "Not found");
	}

	const workflow = contract.workflows.find(
		(workflow) => workflow.lift?.id === liftId
	);

	if (!workflow) {
		throw ev.error(404, "Not found");
	}

	type Workflow = typeof workflow;

	const { workflowSteps: steps, ...rest } = workflow;

	const stepGroups: Workflow["workflowSteps"][] = [];
	for (const step of steps) {
		let group = stepGroups[step.stepType.stepNumber];
		if (!group) {
			group = [];
			stepGroups[step.stepType.stepNumber] = group;
		}

		group.push(step);
	}

	type WorkflowWithLift = Omit<Workflow, "workflowSteps"> & {
		lift: NonNullable<Workflow["lift"]>;
		stepGroups: Workflow["workflowSteps"][];
	};

	return { ...rest, stepGroups } as WorkflowWithLift;
});

export default component$(() => {
	const liftWorkflow = useLiftWorkflow();
	const isAvailable = useStepGroupAvailable(liftWorkflow.value.stepGroups);
	return (
		<>
			<Debugger value={liftWorkflow.value} />
			<Workflow>
				<WorkflowTitle>{liftWorkflow.value.workflowType.name}</WorkflowTitle>
				<WorkflowSteps>
					{liftWorkflow.value.stepGroups.map((stepGroup, i) => (
						<WorkflowStepGroup
							key={i}
							available={isAvailable(i)}
							completed={
								stepGroup.filter((step) => !step.complete).length === 0
							}
						>
							{stepGroup.map((step) => (
								<WorkflowStep key={step.id} step={step}></WorkflowStep>
							))}
						</WorkflowStepGroup>
					))}
				</WorkflowSteps>
			</Workflow>
		</>
	);
});
