import { component$ } from "@builder.io/qwik";
import {
	Workflow,
	WorkflowTitle,
	WorkflowSteps,
	WorkflowStepGroup,
	WorkflowStep,
	useStepGroupAvailable,
} from "../workflow";
import { useWorkflow, useContractCompletion } from "../layout";

export default component$(() => {
	const contractSteps = useWorkflow();
	const contractCompletion = useContractCompletion();

	const isAvailable = useStepGroupAvailable(
		contractSteps.value?.stepGroups,
		contractCompletion.value["Joint Venture Set-up"],
		contractCompletion.value["Trade Set-up"]
	);

	return (
		<Workflow>
			<WorkflowTitle>{contractSteps.value?.workflowType.name}</WorkflowTitle>
			<WorkflowSteps>
				{contractSteps.value?.stepGroups.map((stepGroup, i) => (
					<WorkflowStepGroup
						groupNumber={i}
						completed={stepGroup.filter((step) => !step.complete).length === 0}
						key={i}
						available={isAvailable(i)}
					>
						{stepGroup.map((step) => (
							<WorkflowStep key={step.id} step={step}></WorkflowStep>
						))}
					</WorkflowStepGroup>
				))}
			</WorkflowSteps>
		</Workflow>
	);
});
