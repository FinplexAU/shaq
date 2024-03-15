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
import { HiXMarkSolid } from "@qwikest/icons/heroicons";
import { Button } from "~/components/button";

export const UploadDocumentModal = component$<{
	stepId: string;
	document: WorkflowStep["documents"][number];
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
				class="hover:underline"
				onClick$={() => {
					showSig.value = true;
				}}
			>
				Upload Document
			</button>
			<Modal
				bind:show={showSig}
				class="rounded-base p-7 shadow-md backdrop:backdrop-blur backdrop:backdrop-brightness-50 dark:backdrop:backdrop-brightness-100"
			>
				<ModalHeader>
					<h2 class="pr-10 text-lg font-bold">Upload {props.document.name}</h2>
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
					<ModalContent class="py-6">
						<input type="hidden" name="stepId" value={props.stepId} />
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
								type="file"
								name="document"
								ref={fileInputRef}
								onChange$={(_, b) => {
									buttonEnabled.value = !!b.value;
								}}
							/>
							{buttonEnabled.value && (
								<button onClick$={() => clear()}>
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
