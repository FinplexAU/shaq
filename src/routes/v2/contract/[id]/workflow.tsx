import {
	Slot,
	component$,
	createContextId,
	useComputed$,
	useContext,
	useContextProvider,
	useSignal,
} from "@builder.io/qwik";
import { WorkflowStep, type WorkflowStep as TWorkflowStep } from "./layout";

import { Link } from "@builder.io/qwik-city";
import {
	Timeline,
	TimelineBody,
	TimelineContent,
	TimelineItem,
	TimelinePoint,
} from "~/components/flowbite/components/timeline";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {
	HiArrowRightSolid,
	HiCheckSolid,
	HiChevronDownSolid,
	HiEyeSolid,
} from "@qwikest/icons/heroicons";
import { AppLink } from "~/routes.config";
import type { AppLinkProps } from "~/routes.gen";
import { UploadDocumentModal } from "./upload-document-modal";

export const Workflow = component$(() => (
	<div class="py-4">
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

export const StepGroupContext = createContextId<{ available: boolean }>(
	"step-group"
);

export const WorkflowStepGroup = component$((props: { available: boolean }) => {
	useContextProvider(StepGroupContext, {
		available: props.available,
	});
	return (
		<li
			class={[
				"flex flex-wrap gap-8 border-b border-dashed p-4",
				{ "opacity-20": !props.available },
			]}
		>
			<Slot></Slot>
		</li>
	);
});

export const WorkflowStep = component$(({ step }: { step: TWorkflowStep }) => {
	return (
		<div class="flex-1" key={step.stepId}>
			<h3 class="pb-4 text-xl font-bold">{step.stepName}</h3>
			<Slot></Slot>
			<ul>
				{step.documents.map((document) => (
					<WorkflowDocument
						key={document.typeId}
						document={document}
						step={step}
					></WorkflowDocument>
				))}
			</ul>
		</div>
	);
});

export const WorkflowDocument = component$(
	({
		document,
		step,
	}: {
		document: TWorkflowStep["documents"][number];
		step: WorkflowStep;
	}) => {
		const stepGroupContext = useContext(StepGroupContext);

		const showVersions = useSignal(false);
		const latestDoc = useComputed$(() => {
			return document.versions.at(0);
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
			<li key={document.typeId} class="pb-8">
				<div class="pb-2">
					<h4 class="text-lg font-semibold">{document.name}</h4>
					<div class="flex items-center gap-2 text-sm">
						{latestDoc.value && (
							<>
								<AppLink
									class="hover:underline"
									target="_blank"
									route="/v2/document/[id]/"
									param:id={latestDoc.value.id}
								>
									View Latest
									<HiEyeSolid class="ml-1 inline-block align-icon"></HiEyeSolid>
								</AppLink>
								<div role="none" class="h-1 w-1 rounded-full bg-black"></div>
							</>
						)}
						<UploadDocumentModal
							disabled={!stepGroupContext.available}
							document={document}
							step={step}
						/>
					</div>
				</div>
				{latestDoc.value && (
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
										"text-green-500":
											latestStatus.value.investor === "Approved",
										"text-neutral-500":
											latestStatus.value.investor === "Not Required",
									},
								]}
							>
								{latestStatus.value.investor}
							</span>
						</p>
					</div>
				)}
				<div>
					{document.versions.length > 0 && (
						<label class="block cursor-pointer select-none pb-2 text-sm">
							<span class="hover:underline">
								<HiChevronDownSolid
									class={[
										"mr-1 inline transition-transform align-icon",
										{
											"-rotate-90": !showVersions.value,
										},
									]}
								></HiChevronDownSolid>
								Previous Versions
							</span>
							<input
								class="hidden"
								type="checkbox"
								bind:checked={showVersions}
							></input>
						</label>
					)}
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
			</li>
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
					class="flex-1 hover:underline"
					target="_blank"
					href={`/v2/document/${props.version.id}/`}
				>
					{`${props.document.name} - Version ${props.version.version + 1}`}
					{isLatest.value && <span class="font-semibold"> (Latest)</span>}
					<HiEyeSolid class="ml-1 inline align-icon"></HiEyeSolid>
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
											approvals.value.investor === "Awaiting Approval",
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

export const WorkflowButton = component$(
	(
		props: {
			title: string;
			completion: "complete" | "in-progress" | "disabled";
		} & AppLinkProps
	) => {
		return (
			<AppLink {...props} class="block pb-4">
				<div
					class={[
						"flex items-center justify-between rounded-lg border p-4",
						{
							"border-green-300 bg-green-50 text-green-700":
								props.completion === "complete",
							"border-blue-300 bg-blue-100 text-blue-700":
								props.completion === "in-progress",
							"border-gray-300 bg-gray-100 text-gray-900":
								props.completion === "disabled",
						},
					]}
				>
					<h3>{props.title}</h3>
					{props.completion === "complete" && <HiCheckSolid></HiCheckSolid>}
					{props.completion === "in-progress" && (
						<HiArrowRightSolid></HiArrowRightSolid>
					)}
				</div>
			</AppLink>
		);
	}
);
