import { component$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
import {
	Workflow,
	WorkflowTitle,
	WorkflowSteps,
	WorkflowStepGroup,
	WorkflowStep,
} from "../workflow";
import { useContractStep } from "../layout";
import { Input } from "~/components/input";
export default component$(() => {
	const contractSteps = useContractStep();
	return (
		<Workflow>
			<WorkflowTitle>
				{contractSteps.value?.jointVentureWorkflow.workflowName}
			</WorkflowTitle>
			<WorkflowSteps>
				{contractSteps.value?.jointVentureWorkflow.stepGroups.map(
					(stepGroup, i) => (
						<WorkflowStepGroup key={i}>
							{stepGroup.map((step) => (
								<WorkflowStep key={step.stepId} step={step}>
									{(step.stepName === "Trader Info" ||
										step.stepName === "Investor Info") && (
										<EntityInfoForm></EntityInfoForm>
									)}
								</WorkflowStep>
							))}
						</WorkflowStepGroup>
					)
				)}
			</WorkflowSteps>
		</Workflow>
	);
});

export const EntityInfoForm = component$(() => {
	return (
		<Form class="max-w-prose space-y-4">
			<Input title="Company Name" placeholder="Company Name"></Input>
			<Input title="Address Information" placeholder="Address"></Input>
		</Form>
	);
});
