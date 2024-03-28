import {
	documentTypes,
	documentVersions,
	cycles,
	workflows,
} from "@/drizzle/schema";
import {
	type PropsOf,
	component$,
	useSignal,
	useTask$,
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
import {
	HiCheckSolid,
	HiPencilSolid,
	HiXMarkSolid,
} from "@qwikest/icons/heroicons";
import { AppLink } from "~/routes.config";

export const useCycleWorkflow = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	const cycleId = ev.params.cycleId;
	if (!contractId || !cycleId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const cycleQuery = await db.query.cycles.findFirst({
		where: eq(cycles.id, cycleId),
	});
	if (!cycleQuery) {
		throw ev.error(404, "Not found");
	}

	const queryResult = await db.query.workflows.findFirst({
		where: eq(workflows.id, cycleQuery.workflowId),
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
		cycle: cycleQuery,
		complete: workflow.complete,
		completionReason: workflow.completionReason,
		contractId: workflow.contractId,
		id: workflow.id,
		workflowType: workflow.workflowType,
		stepGroups: stepGroups,
	};
});

export const useUpdateCycle = routeAction$(
	async (data, ev) => {
		const id = ev.params.cycleId;
		if (!id) {
			throw ev.error(404, "Not Found");
		}
		const db = await drizzleDb;

		await db
			.update(cycles)
			.set({
				cost: data.cost?.toString(),
				volume: data.volume?.toString(),
				expectedDate: data.expectedDate,
			})
			.where(eq(cycles.id, id));
	},
	zod$(
		z
			.object({
				cost: z.coerce.number().positive().optional(),
				volume: z.coerce.number().positive().optional(),
				expectedDate: z.coerce.date().optional(),
			})
			.refine(
				(input) => Object.keys(input).length > 0,
				"At least one value must be set"
			)
	)
);

export default component$(() => {
	const cycleWorkflow = useCycleWorkflow();
	const isAvailable = useStepGroupAvailable(cycleWorkflow.value.stepGroups);
	const nav = useNavigate();
	return (
		<div>
			<div class="p-2">
				<Button
					onClick$={() => {
						history.back();
					}}
				>
					Back
				</Button>
			</div>
			<Workflow>
				<WorkflowTitle>{cycleWorkflow.value.workflowType.name}</WorkflowTitle>
				<div class="grid grid-cols-3 gap-4 p-4 ">
					<EditableField
						title="Cost"
						value={cycleWorkflow.value.cycle.cost}
						type="number"
						name="cost"
					/>
					<EditableField
						title="Volume"
						value={cycleWorkflow.value.cycle.volume}
						type="number"
						name="volume"
					/>
					<EditableField
						title="Expected Settlement Date"
						value={cycleWorkflow.value.cycle.expectedDate
							.toISOString()
							.substring(0, 10)}
						type="date"
						name="expectedDate"
					/>
				</div>
				<WorkflowSteps>
					{cycleWorkflow.value.stepGroups.map((stepGroup, i) => (
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
		</div>
	);
});

export const EditableField = component$<{
	value: string | number | null | undefined;
	title: string;
	type?: PropsOf<"input">["type"];
	name: PropsOf<"input">["name"];
}>((props) => {
	const open = useSignal(false);
	const inputRef = useSignal<HTMLInputElement>();
	const updateCycle = useUpdateCycle();

	useTask$(({ track }) => {
		track(() => props.value);

		if (!inputRef.value) {
			return;
		}

		inputRef.value.value = props.value?.toString() ?? "";
	});

	return (
		<Form action={updateCycle}>
			<div class="flex items-end gap-3">
				<Input
					title={props.title}
					value={props.value}
					name={props.name}
					type={props.type}
					disabled={!open.value}
					ref={inputRef}
					class="w-52"
					placeholder="-"
				/>
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
