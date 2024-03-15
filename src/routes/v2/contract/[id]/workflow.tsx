import { Slot, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { useUploadDocument, type WorkflowStep as TWorkflowStep } from ".";

import { Form, Link } from "@builder.io/qwik-city";
import {
	Timeline,
	TimelineBody,
	TimelineContent,
	TimelineItem,
	TimelinePoint,
} from "~/components/flowbite/components/timeline";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { HiChevronDownSolid } from "@qwikest/icons/heroicons";

export const Workflow = component$(() => (
	<div>
		<Slot></Slot>
	</div>
));

export const WorkflowTitle = component$(() => {
	return (
		<h2 class="px-4 pb-8 text-2xl font-bold">
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
		<li class="flex flex-wrap gap-8 border-b border-dashed p-4">
			<Slot></Slot>
		</li>
	);
});

export const WorkflowStep = component$(({ step }: { step: TWorkflowStep }) => {
	return (
		<div class="flex-1" key={step.stepId}>
			<h3 class="pb-4 text-xl font-bold">{step.stepName}</h3>
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
				<div class="pb-2">
					<h4 class="text-lg font-semibold">{document.name}</h4>
					<div class="flex items-center gap-2 text-sm">
						{latestDoc.value && (
							<>
								<button>View Latest</button>
								<div role="none" class="h-1 w-1 rounded-full bg-black"></div>
							</>
						)}
						<Form action={uploadVersion}>
							{/* <input
							type="hidden"
							name="documentTypeId"
							value={document.typeId}
						></input>
						<input type="hidden" name="stepId" value={stepId}></input>
						<input type="file" name="document"></input> */}
							<button>Upload Version</button>
						</Form>
					</div>
				</div>
				<div class="pb-2 text-sm">
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
				<div class="pb-4">
					<label class="block cursor-pointer select-none pb-2 text-sm">
						<span class="hover:underline">
							Previous Versions
							<HiChevronDownSolid
								class={[
									"ml-1 inline transition-transform align-icon",
									{
										"-rotate-90": !showVersions.value,
									},
								]}
							></HiChevronDownSolid>
						</span>
						<input
							class="hidden"
							type="checkbox"
							bind:checked={showVersions}
						></input>
					</label>
					{showVersions.value && (
						<Timeline class="max-w-prose">
							{document.versions.map((version) => (
								<TimelineItem key={version.id}>
									<TimelinePoint></TimelinePoint>
									<TimelineContent>
										<TimelineBody>
											<WorkflowDocumentVersion
												version={version}
												document={document}
											></WorkflowDocumentVersion>
										</TimelineBody>
									</TimelineContent>
								</TimelineItem>
							))}
						</Timeline>
					)}
				</div>
			</div>
		);
	}
);

export const WorkflowDocumentVersion = component$(
	(props: {
		document: TWorkflowStep["documents"][number];
		version: TWorkflowStep["documents"][number]["versions"][number];
	}) => {
		const isLatest = useComputed$(
			() => props.document.versions.at(0)?.id === props.version.id
		);
		TimeAgo.addLocale(en);
		const timeAgo = new TimeAgo("en-US");

		const approvals = useComputed$<{
			trader:
				| "Approved"
				| "Not Approved"
				| "Not Required"
				| "Awaiting Approval";
			investor:
				| "Approved"
				| "Not Approved"
				| "Not Required"
				| "Awaiting Approval";
		}>(() => {
			const trader = props.document.traderApprovalRequired
				? props.version.traderApproval
					? "Approved"
					: isLatest.value
						? "Awaiting Approval"
						: "Not Approved"
				: "Not Required";
			const investor = props.document.investorApprovalRequired
				? props.version.investorApproval
					? "Approved"
					: isLatest.value
						? "Awaiting Approval"
						: "Not Approved"
				: "Not Required";

			return { trader, investor };
		});

		return (
			<div class="flex flex-wrap rounded-lg border p-2 text-sm text-black shadow-sm">
				<Link
					class="flex-1"
					target="_blank"
					href={`/v2/document/${props.version.id}/`}
				>
					{`${props.document.name} - Version ${props.version.version + 1}`}
					{isLatest.value && <span class="font-semibold"> (Latest)</span>}
				</Link>
				<time class="text-xs text-neutral-400">
					{timeAgo.format(props.version.createdAt)}
				</time>
				<div class="min-w-full">
					{props.document.traderApprovalRequired && (
						<p class="font-bold">
							Trader Approval:{" "}
							<span
								class={[
									"font-normal",
									{
										"text-red-500": approvals.value.trader === "Not Approved",
										"text-amber-500":
											approvals.value.trader === "Awaiting Approval",
										"text-green-500": approvals.value.trader === "Approved",
										"text-neutral-500":
											approvals.value.trader === "Not Required",
									},
								]}
							>
								{approvals.value.trader}
							</span>
						</p>
					)}
					{props.document.investorApprovalRequired && (
						<p class="font-bold">
							Investor Approval:{" "}
							<span
								class={[
									"font-normal",
									{
										"text-red-500": approvals.value.investor === "Not Approved",
										"text-amber-500":
											approvals.value.trader === "Awaiting Approval",
										"text-green-500": approvals.value.investor === "Approved",
										"text-neutral-500":
											approvals.value.investor === "Not Required",
									},
								]}
							>
								{approvals.value.investor}
							</span>
						</p>
					)}
				</div>
			</div>
		);
	}
);
