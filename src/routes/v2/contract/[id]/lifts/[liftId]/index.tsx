import {
	documentTypes,
	documentVersions,
	lifts,
	workflows,
} from "@/drizzle/schema";
import {
	PropsOf,
	component$,
	useSignal,
	useTask$,
	useVisibleTask$,
} from "@builder.io/qwik";
import {
	Form,
	routeAction$,
	routeLoader$,
	useNavigate,
	z,
	zod$,
} from "@builder.io/qwik-city";
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
import { Input } from "~/components/input";
import { Button } from "~/components/button";
import { useVisible } from "@qwik-ui/headless";
import {
	HiCheckSolid,
	HiPencilSolid,
	HiXCircleSolid,
	HiXMarkSolid,
} from "@qwikest/icons/heroicons";

export const useLiftWorkflow = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	const liftId = ev.params.liftId;
	if (!contractId || !liftId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const liftQuery = await db.query.lifts.findFirst({
		where: eq(lifts.id, liftId),
	});
	if (!liftQuery) {
		throw ev.error(404, "Not found");
	}

	const queryResult = await db.query.workflows.findFirst({
		where: eq(workflows.id, liftQuery.workflowId),
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

	if (!queryResult) throw ev.error(404, "Not Found");

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
		lift: liftQuery,
		complete: workflow.complete,
		completionReason: workflow.completionReason,
		contractId: workflow.contractId,
		id: workflow.id,
		workflowType: workflow.workflowType,
		stepGroups: stepGroups,
	};
});

export const useUpdateLift = routeAction$(
	async (data, ev) => {
		console.log(data);
		const id = ev.params.liftId;
		if (!id) {
			throw ev.error(404, "Not Found");
		}
		const db = await drizzleDb;

		await db.update(lifts).set({
			cost: data.cost?.toString(),
			volume: data.volume?.toString(),
			settlementDate: data.expectedSettlementDate,
		});
	},
	zod$(
		z
			.object({
				cost: z.coerce.number().positive().optional(),
				volume: z.coerce.number().positive().optional(),
				expectedSettlementDate: z.coerce.date().optional(),
			})
			.refine(
				(x) => Object.keys(x).length > 0,
				"At least one value must be set"
			)
	)
);

export default component$(() => {
	const liftWorkflow = useLiftWorkflow();
	const isAvailable = useStepGroupAvailable(liftWorkflow.value.stepGroups);

	return (
		<>
			<Workflow>
				<WorkflowTitle>{liftWorkflow.value.workflowType.name}</WorkflowTitle>
				<div class="flex max-w-prose flex-col gap-4 p-8 pb-0">
					<EditableField
						label="Cost"
						value={liftWorkflow.value.lift.cost}
						type="number"
						name="cost"
					/>
					<EditableField
						label="Volume"
						value={liftWorkflow.value.lift.volume}
						type="number"
						name="volume"
					/>
					<EditableField
						label="Settlement Date"
						value={liftWorkflow.value.lift.settlementDate
							?.toISOString()
							.substring(0, 10)}
						type="date"
						name="expectedSettlementDate"
					/>
				</div>
				<WorkflowSteps>
					{liftWorkflow.value.stepGroups.map((stepGroup, i) => (
						<WorkflowStepGroup
							key={i}
							available={isAvailable(i)}
							groupNumber={i}
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

export const EditableField = component$<{
	value: string | number | null | undefined;
	label: string;
	type?: PropsOf<"input">["type"];
	name: PropsOf<"input">["name"];
}>((props) => {
	const open = useSignal(false);
	const inputRef = useSignal<HTMLInputElement>();
	const updateLift = useUpdateLift();

	useTask$(({ track }) => {
		track(() => props.value);

		if (!inputRef.value) {
			return;
		}

		inputRef.value.value = props.value?.toString() ?? "";
	});

	return (
		<Form action={updateLift}>
			<div class="flex items-center gap-3">
				<div class="flex items-center">
					<span class="w-40">{props.label}:</span>
					{
						<Input
							value={props.value}
							name={props.name}
							type={props.type}
							disabled={!open.value}
							ref={inputRef}
							class="w-52"
							placeholder="-"
						/>
					}
				</div>
				{open.value && (
					<Button
						type="submit"
						onClick$={() => {
							open.value = !open.value;
						}}
					>
						<HiCheckSolid />
					</Button>
				)}
				<Button
					type="button"
					onClick$={() => {
						open.value = !open.value;
						if (!open.value && inputRef.value) {
							inputRef.value.value = props.value?.toString() ?? "";
						}
					}}
				>
					{!open.value && <HiPencilSolid />}
					{open.value && <HiXMarkSolid />}
				</Button>
			</div>
		</Form>
	);
});
