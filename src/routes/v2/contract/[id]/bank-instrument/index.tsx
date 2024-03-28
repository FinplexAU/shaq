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
import { Button } from "~/components/button";
import { completeWorkflowStepIfNeeded } from "~/db/completion";
import { server$ } from "@builder.io/qwik-city";

export default component$(() => {
	const contractSteps = useWorkflow();
	const contractCompletion = useContractCompletion();

	const isAvailable = useStepGroupAvailable(
		contractSteps.value?.stepGroups,
		contractCompletion.value["Joint Venture Set-up"],
		contractCompletion.value["Trade Set-up"],
		contractCompletion.value["Bank Instrument Set-up"]
	);

	return (
		<Workflow>
			<WorkflowTitle>{contractSteps.value?.workflowType.name}</WorkflowTitle>
			<WorkflowSteps>
				{contractSteps.value?.stepGroups.map((stepGroup, i) => (
					<WorkflowStepGroup
						completed={stepGroup.filter((step) => !step.complete).length === 0}
						groupNumber={i}
						key={i}
						available={isAvailable(i)}
					>
						{stepGroup.map((step) => (
							<WorkflowStep key={step.id} step={step}>
								{step.stepType.name === "Engage Supplier" &&
									(!step.complete ? (
										<Button
											onClick$={() => {
												const server = server$(() => {
													completeWorkflowStepIfNeeded(step.id);
												});
												server();
											}}
										>
											Complete
										</Button>
									) : (
										<p>Engaged {step.complete.toLocaleDateString([])}</p>
									))}
							</WorkflowStep>
						))}
					</WorkflowStepGroup>
				))}
			</WorkflowSteps>
		</Workflow>
	);
});
