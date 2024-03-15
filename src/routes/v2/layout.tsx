import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
	return (
		<div class="flex min-h-screen flex-col">
			<Slot></Slot>
		</div>
	);
});
