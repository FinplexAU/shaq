import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { WorkflowStep } from "./layout";
import { useUploadDocument } from "./layout";
import { Form } from "@builder.io/qwik-city";
import {
	Modal,
	ModalHeader,
	ModalContent,
	ModalFooter,
} from "@qwik-ui/headless";
import { HiArrowUpCircleSolid, HiXMarkSolid } from "@qwikest/icons/heroicons";
import { Button } from "~/components/button";

export const UploadDocumentModal = component$<{
	step: WorkflowStep;
	document: WorkflowStep["documents"][number];
	disabled?: boolean;
}>((props) => {
	const showSig = useSignal(false);
	const fileInputRef = useSignal<HTMLInputElement>();
	const buttonEnabled = useSignal(false);
	const errorMessage = useSignal<string>();

	const upload = useUploadDocument();

	const clear = $(() => {
		if (fileInputRef.value) fileInputRef.value.value = "";
		buttonEnabled.value = false;
		errorMessage.value = undefined;
	});

	useTask$(({ track }) => {
		if (!track(showSig)) {
			clear();
		}
	});

	return (
		<>
			<button
				disabled={props.disabled}
				class="hover:underline disabled:hover:no-underline"
				onClick$={() => {
					showSig.value = true;
				}}
			>
				Upload Document
				<HiArrowUpCircleSolid class="ml-1 inline align-icon"></HiArrowUpCircleSolid>
			</button>
			<Modal
				bind:show={showSig}
				class="w-[65ch] rounded p-7 shadow-md backdrop:backdrop-blur backdrop:backdrop-brightness-50 dark:backdrop:backdrop-brightness-100"
			>
				<ModalHeader>
					<h2 class="font-bold">{props.step.stepName}</h2>
					<h3 class="pb-4 pr-10 text-lg font-semibold">
						Upload {props.document.name}
					</h3>
					<div class="pb-8">
						<h4 class="font-semibold">Required Approval</h4>
						<ul>
							{props.document.investorApprovalRequired && (
								<li class="list-inside list-disc">Investor</li>
							)}
							{props.document.traderApprovalRequired && (
								<li class="list-inside list-disc">Trader</li>
							)}
						</ul>
					</div>
				</ModalHeader>
				<Form
					action={upload}
					onSubmitCompleted$={(ev) => {
						if (ev.detail.status !== 200) {
							if (ev.detail.value.message) {
								errorMessage.value = ev.detail.value.message;
							} else {
								console.error(ev.detail.value);
								errorMessage.value =
									"Something unexpected occurred. File was not uploaded";
							}
						} else {
							showSig.value = false;
						}
					}}
				>
					<ModalContent class="py-4">
						<input type="hidden" name="stepId" value={props.step.stepId} />
						<input
							type="hidden"
							name="documentTypeId"
							value={props.document.typeId}
						/>
						{errorMessage.value && (
							<p class="pb-2 font-semibold text-red-600">
								{errorMessage.value}
							</p>
						)}
						<div class="flex">
							<input
								class="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 outline-none file:!bg-gradient-to-t file:!from-blue-400 file:!to-blue-500/80 "
								type="file"
								name="document"
								ref={fileInputRef}
								onChange$={(_, b) => {
									buttonEnabled.value = !!b.value;
								}}
							></input>
							{buttonEnabled.value && (
								<button type="button" onClick$={() => clear()} class="pl-2">
									<HiXMarkSolid class="h-6 w-6" />
								</button>
							)}
						</div>
					</ModalContent>
					<ModalFooter class="flex justify-end gap-4">
						<Button onClick$={() => (showSig.value = false)} type="button">
							Cancel
						</Button>
						<Button disabled={!buttonEnabled.value} type="submit">
							Upload
						</Button>
					</ModalFooter>
				</Form>
				<button
					onClick$={() => (showSig.value = false)}
					class="absolute right-6 top-6"
				>
					<HiXMarkSolid class="h-8 w-8" />
				</button>
			</Modal>
		</>
	);
});
