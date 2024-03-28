import {
	type Signal,
	Slot,
	component$,
	createContextId,
	useComputed$,
	useContextProvider,
	useContext,
	useSignal,
	useVisibleTask$,
} from "@builder.io/qwik";
import type {
	WorkflowDocumentType as TWorkflowDocumentType,
	WorkflowStep as TWorkflowStep,
	WorkflowDocumentVersion as TWorkflowDocumentVersion,
} from "./layout";
import { useLoadContract, useApproveDocument } from "./layout";
import { Form, Link, useLocation } from "@builder.io/qwik-city";
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
	HiArrowUpCircleSolid,
	HiCheckSolid,
	HiChevronDownSolid,
	HiDocumentSolid,
	HiEyeSolid,
} from "@qwikest/icons/heroicons";
import { AppLink, appUrl } from "~/routes.config";
import type { AppLinkProps } from "~/routes.gen";
import { UploadDocumentModal } from "./upload-document-modal";

export const Workflow = component$(() => (
	<div class="py-4">
		<Slot></Slot>
	</div>
));

export const WorkflowTitle = component$(() => {
	return (
		<>
			<h2 class="p-2 px-4 text-2xl font-bold">
				<Slot></Slot>
				<div
					role="none"
					class="h-1 bg-gradient-to-r from-blue-300 via-blue-400 to-green-400"
				></div>
			</h2>
		</>
	);
});

export const WorkflowSteps = component$(() => {
	return (
		<ol class="list-inside list-decimal">
			<Slot></Slot>
		</ol>
	);
});

export const StepGroupContext = createContextId<{
	available: Readonly<Signal<boolean>>;
	showSteps: Signal<boolean>;
}>("step-group");

export const WorkflowStepGroup = component$(
	(props: { available: boolean; completed: boolean; groupNumber: number }) => {
		const showSteps = useSignal(!props.completed);
		const ref = useSignal<HTMLElement | undefined>();
		useContextProvider(StepGroupContext, {
			available: useComputed$(() => props.available),
			showSteps: showSteps,
		});

		// eslint-disable-next-line qwik/no-use-visible-task
		useVisibleTask$(
			({ track }) => {
				const trackedRef = track(ref);
				if (props.groupNumber === 0) return;
				if (props.completed || !props.available) {
					return;
				}

				if (!trackedRef) {
					return;
				}

				window.scrollTo({
					left: 0,
					top: trackedRef.getBoundingClientRect().y,
					behavior: "smooth",
				});
			},
			{
				strategy: "document-ready",
			}
		);

		return (
			<li
				ref={ref}
				class={[
					"relative flex flex-wrap gap-8 border-b-2 border-dashed p-4 pt-8 ",
					{ "opacity-20": !props.available },
				]}
			>
				{props.completed && (
					<div class="absolute right-20 top-8 rotate-12 rounded border-8 border-double border-green-500 p-1 ">
						<p class=" select-none text-4xl font-black text-green-500">
							Completed
						</p>
					</div>
				)}
				{!props.available && (
					<div class="absolute left-0 top-0 z-10 h-full w-full"></div>
				)}

				<button
					onClick$={() => {
						showSteps.value = !showSteps.value;
					}}
					class="absolute flex items-center text-sm"
				>
					<p class="list-item text-sm">View</p>
					<HiChevronDownSolid
						class={[
							"ml-1 transition-transform",
							{
								"rotate-90": !showSteps.value,
							},
						]}
					></HiChevronDownSolid>
				</button>
				<Slot></Slot>
			</li>
		);
	}
);

export const WorkflowStep = component$(({ step }: { step: TWorkflowStep }) => {
	const groupContext = useContext(StepGroupContext);
	return (
		<div class="flex-1 pt-8" key={step.id}>
			<div class="flex items-center gap-2">
				<h3 class="pb-4 text-xl font-semibold hover:underline">
					{step.stepType.name}
				</h3>
			</div>
			{groupContext.showSteps.value ? (
				<>
					<Slot></Slot>
					<ul class="grid  max-w-3xl gap-2 pt-8">
						{step.stepType.documentTypes.length > 0 ? (
							<li class="grid grid-cols-12 items-center gap-1 text-xs [&>*]:px-2 ">
								<p class="">View</p>
								<p class="col-span-6 ">Title</p>
								<p class="col-span-2 ">Trader</p>
								<p class="col-span-2 ">Investor</p>
								<p>Upload</p>
							</li>
						) : undefined}
						{step.stepType.documentTypes.map((document) => (
							<WorkflowDocument
								key={document.id}
								document={document}
								step={step}
							></WorkflowDocument>
						))}
						{!step.complete && (
							<li class="hover grid cursor-pointer items-center gap-1 overflow-hidden rounded [&>*]:bg-gray-100 [&>*]:px-2 [&>*]:py-1">
								<UploadDocumentModal step={step}>
									<div class="p-1 hover:bg-gray-200">Add Document</div>
								</UploadDocumentModal>
							</li>
						)}
					</ul>
				</>
			) : undefined}
		</div>
	);
});

export const WorkflowDocument = component$(
	({
		document,
		step,
	}: {
		document: TWorkflowDocumentType;
		step: TWorkflowStep;
	}) => {
		const approveDocument = useApproveDocument();
		const contract = useLoadContract();

		const showVersions = useSignal(false);
		const latestDoc = useComputed$(() => {
			return document.documentVersions.at(0);
		});

		const requiresUserApproval = useComputed$(() => {
			return (
				latestDoc.value && {
					trader:
						contract.value.isTrader &&
						document.traderApprovalRequired &&
						!latestDoc.value.traderApproval,
					investor:
						contract.value.isInvestor &&
						document.investorApprovalRequired &&
						!latestDoc.value.investorApproval,
				}
			);
		});

		const latestStatus = useComputed$<{
			trader: "Approved" | "Awaiting" | "-";
			investor: "Approved" | "Awaiting" | "-";
		}>(() => {
			const trader = document.traderApprovalRequired
				? latestDoc.value?.traderApproval
					? "Approved"
					: "Awaiting"
				: "-";
			const investor = document.investorApprovalRequired
				? latestDoc.value?.investorApproval
					? "Approved"
					: "Awaiting"
				: "-";

			return { trader, investor };
		});

		return (
			<li key={document.id}>
				<div class="grid grid-cols-12 items-center gap-1 overflow-hidden rounded [&>*]:h-full [&>*]:bg-gray-100 [&>*]:px-2 [&>*]:py-1">
					<div
						class={[
							"grid place-items-center",
							{
								"cursor-pointer hover:bg-gray-200": Boolean(latestDoc.value),
							},
						]}
					>
						{latestDoc.value ? (
							<AppLink
								target="_blank"
								route="/v2/document/[id]/"
								param:id={latestDoc.value.id}
								class="grid h-full w-full place-items-center"
							>
								<HiDocumentSolid class="text-lg"></HiDocumentSolid>{" "}
							</AppLink>
						) : undefined}
					</div>
					<p
						class="col-span-6 flex-1 cursor-pointer hover:bg-gray-200"
						onClick$={() => {
							showVersions.value = !showVersions.value;
						}}
					>
						{document.documentName}
						<span class="text-sm font-light text-neutral-400">
							{latestDoc.value && `(v${latestDoc.value.version + 1})`}
						</span>
					</p>
					<div
						class={[
							"col-span-2 border text-center",
							{
								"border-amber-300 !bg-amber-50 text-amber-500":
									latestStatus.value.trader === "Awaiting",
								"border-green-300 !bg-green-50 text-green-700":
									latestStatus.value.trader === "Approved",
								"text-neutral-500": latestStatus.value.trader === "-",
								"hover:!bg-amber-100": requiresUserApproval.value?.trader,
							},
						]}
					>
						{requiresUserApproval.value?.trader ? (
							<Form action={approveDocument}>
								<input
									type="hidden"
									name="documentVersionId"
									value={latestDoc.value?.id}
								/>
								<button class="h-full w-full text-left text-center">
									Approve
								</button>
							</Form>
						) : (
							latestStatus.value.trader
						)}
					</div>
					<div
						class={[
							"col-span-2 border text-center",
							{
								"border-amber-300 !bg-amber-50 text-amber-500":
									latestStatus.value.investor === "Awaiting",
								"border-green-300 !bg-green-50 text-green-700":
									latestStatus.value.investor === "Approved",
								"text-neutral-500": latestStatus.value.investor === "-",
								"hover:!bg-amber-100": requiresUserApproval.value?.investor,
							},
						]}
					>
						{requiresUserApproval.value?.investor ? (
							<Form action={approveDocument}>
								<input
									type="hidden"
									name="documentVersionId"
									value={latestDoc.value?.id}
								/>
								<button class="h-full w-full text-center">Approve</button>
							</Form>
						) : (
							latestStatus.value.investor
						)}
					</div>
					<UploadDocumentModal document={document} step={step}>
						<div class="grid h-full w-full cursor-pointer place-items-center hover:bg-gray-200">
							<HiArrowUpCircleSolid class="text-xl"></HiArrowUpCircleSolid>
						</div>
					</UploadDocumentModal>
					{showVersions.value && (
						<div class="col-span-full">
							{document.documentVersions.length > 0 ? (
								<Timeline class="max-w-prose">
									{document.documentVersions.map((version) => (
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
							) : (
								<p class="text-sm text-neutral-400">
									No document have been uploaded yet.
								</p>
							)}
						</div>
					)}
				</div>
			</li>
		);
	}
);

export const WorkflowDocumentVersion = component$(
	(props: {
		document: TWorkflowDocumentType;
		version: TWorkflowDocumentVersion;
	}) => {
		const isLatest = useComputed$(
			() => props.document.documentVersions.at(0)?.id === props.version.id
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
			<div class="flex flex-wrap rounded-lg border bg-white p-2 text-sm text-black shadow-sm">
				<Link
					class="flex-1 hover:underline"
					target="_blank"
					href={`/v2/document/${props.version.id}/`}
				>
					{`${props.document.documentName} - Version ${props.version.version + 1}`}
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
								<span class="text-xs text-neutral-400">
									{props.version.traderApproval &&
										` - ${timeAgo.format(props.version.traderApproval)}`}
								</span>
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
			completion: boolean;
		} & AppLinkProps
	) => {
		const loc = useLocation();
		const isOnPath = useComputed$(() => {
			const currentPath = (appUrl as any)(props.route as any, props, "param:");
			return loc.url.pathname === currentPath;
		});
		return (
			<AppLink {...props} class="block pb-4">
				<div
					class={[
						"flex items-center justify-between rounded-lg border p-4  shadow-lg transition-transform",
						{
							"border-green-300 bg-gradient-to-tr from-green-50 via-green-50 to-green-100 text-green-700":
								props.completion && !isOnPath.value,
							"border-blue-300 bg-gradient-to-tr  from-green-50 via-green-100 to-blue-200 text-blue-700":
								isOnPath.value,
							"border-gray-300  bg-gray-50 text-gray-900":
								!props.completion && !isOnPath.value,
						},
					]}
				>
					<h3>{props.title}</h3>

					{loc.url.pathname ===
					(appUrl as any)(props.route as any, props, "param:") ? (
						<HiArrowRightSolid></HiArrowRightSolid>
					) : (
						props.completion && <HiCheckSolid></HiCheckSolid>
					)}
				</div>
			</AppLink>
		);
	}
);

export const useStepGroupAvailable = (
	stepGroups?: TWorkflowStep[][],
	...previousWorkflows: (Date | null | undefined)[]
) => {
	const incompletePrevious = useComputed$(() =>
		previousWorkflows.some((p) => !p)
	);

	return (i: number): boolean => {
		if (incompletePrevious.value) {
			return false;
		}
		if (i === 0) {
			return true;
		}

		return (
			stepGroups?.[i - 1]?.reduce((a, b) => Boolean(b.complete) && a, true) ??
			false
		);
	};
};
