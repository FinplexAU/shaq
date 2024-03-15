import { Slot, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { useUploadDocument, type WorkflowStep as TWorkflowStep } from ".";

import { Form } from "@builder.io/qwik-city";
import {
	Timeline,
	TimelineBody,
	TimelineContent,
	TimelineItem,
	TimelinePoint,
	TimelineTime,
} from "~/components/flowbite/components/timeline";

export const Workflow = component$(() => <Slot></Slot>);

export const WorkflowTitle = component$(() => {
	return (
		<h2 class="text-2xl font-bold">
			<Slot></Slot>
		</h2>
	);
});

export const WorkflowSteps = component$(() => {
	return (
		<ol>
			<Slot></Slot>
		</ol>
	);
});

export const WorkflowStepGroup = component$(() => {
	return (
		<li class="flex flex-wrap border-b border-dashed">
			<Slot></Slot>
		</li>
	);
});

export const WorkflowStep = component$(({ step }: { step: TWorkflowStep }) => {
	return (
		<div class="flex-1" key={step.stepId}>
			<h3 class="text-xl font-semibold">{step.stepName}</h3>
			<Slot></Slot>
			{step.documents.map((document) => (
				<WorkflowDocument
					key={document.typeId}
					document={document}
					stepId={step.stepId}
				></WorkflowDocument>
			))}
		</div>
	);
});

export const WorkflowDocument = component$(
	({
		document,
		stepId,
	}: {
		document: TWorkflowStep["documents"][number];
		stepId: string;
	}) => {
		const uploadVersion = useUploadDocument();
		const showVersions = useSignal(false);
		const latestDoc = useComputed$(() => {
			return document.versions.at(-1);
		});

		const latestStatus = useComputed$<{
			trader: "Approved" | "Awaiting Approval" | "Not Required";
			investor: "Approved" | "Awaiting Approval" | "Not Required";
		}>(() => {
			const trader = document.traderApprovalRequired
				? latestDoc.value?.traderApproval
					? "Approved"
					: "Awaiting Approval"
				: "Not Required";
			const investor = document.investorApprovalRequired
				? latestDoc.value?.investorApproval
					? "Approved"
					: "Awaiting Approval"
				: "Not Required";

			return { trader, investor };
		});

		return (
			<div key={document.typeId}>
				<h4 class="font-bold">{document.name}</h4>
				<div class="flex items-center gap-2 text-sm">
					{latestDoc.value && (
						<>
							<button>View Latest</button>
							<div role="none" class="h-1 w-1 rounded-full bg-black"></div>
						</>
					)}
					<Form action={uploadVersion}>
						<input
							type="hidden"
							name="documentTypeId"
							value={document.typeId}
						></input>
						<input type="hidden" name="stepId" value={stepId}></input>
						<input type="file" name="document"></input>
						<button>Upload Version</button>
					</Form>
				</div>
				<div class="text-sm">
					<p class="font-bold">
						Trader Approval:{" "}
						<span
							class={[
								"font-normal",
								{
									"text-amber-500":
										latestStatus.value.trader === "Awaiting Approval",
									"text-green-500": latestStatus.value.trader === "Approved",
									"text-neutral-500":
										latestStatus.value.trader === "Not Required",
								},
							]}
						>
							{latestStatus.value.trader}
						</span>
					</p>
					<p class="font-bold">
						Investor Approval:{" "}
						<span
							class={[
								"font-normal",
								{
									"text-amber-500":
										latestStatus.value.investor === "Awaiting Approval",
									"text-green-500": latestStatus.value.investor === "Approved",
									"text-neutral-500":
										latestStatus.value.investor === "Not Required",
								},
							]}
						>
							{latestStatus.value.investor}
						</span>
					</p>
				</div>
				<label class="cursor-pointer select-none text-sm">
					Previous Versions Triangle{" "}
					<input
						class="hidden"
						type="checkbox"
						bind:checked={showVersions}
					></input>
				</label>
				{showVersions.value &&
					document.versions.map((version) => (
						<Timeline key={version.id}>
							<TimelineItem>
								<TimelinePoint></TimelinePoint>
								<TimelineContent>
									<TimelineTime>
										{version.createdAt.toLocaleDateString([])}
									</TimelineTime>
									<TimelineBody>
										<div>Hello World</div>
									</TimelineBody>
								</TimelineContent>
							</TimelineItem>
						</Timeline>
					))}
			</div>
		);
	}
);
